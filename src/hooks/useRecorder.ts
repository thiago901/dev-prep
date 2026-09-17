import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Audio capture for an interview take.
 *
 * Beyond producing a blob, this owns the things the transport needs to feel
 * mechanical rather than approximate: a ticking counter that survives pauses,
 * a live input level for the meter, and an accumulated peak trail that becomes
 * the waveform of the finished take.
 *
 * Microphone failure is treated as a normal state, not an exception. Denied,
 * missing and unsupported are distinct because the recovery differs for each.
 */

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopped';

export type RecorderError =
  | { kind: 'denied' }
  | { kind: 'unsupported' }
  | { kind: 'missing-device' }
  | { kind: 'failed'; message: string }
  | { kind: 'limit-reached'; minutes: number };

export interface RecordedTake {
  blob: Blob;
  durationMs: number;
  mimeType: string;
  /** Normalised 0..1 peaks, one every ~100ms, for drawing the waveform. */
  peaks: number[];
}

export interface UseRecorderOptions {
  maxDurationMs?: number;
  onComplete?: (take: RecordedTake) => void;
}

/** How often a peak is captured. 100ms gives a readable trail without bloat. */
const PEAK_INTERVAL_MS = 100;

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const { maxDurationMs = 5 * 60 * 1000, onComplete } = options;

  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<RecorderError | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const peakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed time is derived from wall clock rather than counted, so a
  // backgrounded tab does not drift, and pauses are subtracted explicitly.
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const currentLevelRef = useRef(0);
  const cancelledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // The peak trail is mirrored into a ref so `onstop` can read the final
  // version without depending on a render having flushed first.
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const teardown = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (peakTimerRef.current) clearInterval(peakTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    rafRef.current = null;
    peakTimerRef.current = null;
    tickRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
    recorderRef.current = null;
    setLevel(0);
    currentLevelRef.current = 0;
  }, []);

  useEffect(() => teardown, [teardown]);

  const readLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);

    // Root mean square of the waveform, which tracks perceived loudness far
    // better than peak amplitude and keeps the meter from flickering.
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const sample = (buffer[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / buffer.length);
    const normalised = Math.min(1, rms * 3.2);

    currentLevelRef.current = normalised;
    setLevel(normalised);

    rafRef.current = requestAnimationFrame(readLevel);
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) {
      setError({ kind: 'unsupported' });
      return;
    }

    setError(null);
    setStatus('requesting');
    cancelledRef.current = false;
    chunksRef.current = [];
    accumulatedRef.current = 0;
    setElapsedMs(0);
    setPeaks([]);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (cause) {
      setStatus('idle');
      const name = (cause as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError({ kind: 'denied' });
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError({ kind: 'missing-device' });
      } else {
        setError({ kind: 'failed', message: (cause as Error)?.message ?? 'unknown' });
      }
      return;
    }

    streamRef.current = stream;

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch (cause) {
      teardown();
      setStatus('idle');
      setError({ kind: 'failed', message: (cause as Error)?.message ?? 'unknown' });
      return;
    }

    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      const durationMs = accumulatedRef.current;
      const collected = chunksRef.current;
      const capturedPeaks = peaksRef.current;

      teardown();
      setStatus('stopped');

      if (cancelledRef.current) {
        chunksRef.current = [];
        return;
      }

      const blob = new Blob(collected, { type: recorder.mimeType || 'audio/webm' });
      chunksRef.current = [];

      onCompleteRef.current?.({
        blob,
        durationMs,
        mimeType: recorder.mimeType || 'audio/webm',
        peaks: capturedPeaks,
      });
    };

    // A dedicated audio graph for the meter. The recorder gets the raw stream;
    // this only observes it.
    try {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      audioContextRef.current = context;
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(readLevel);
    } catch {
      // No meter is a cosmetic loss; the take still records.
    }

    startedAtRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const total = accumulatedRef.current + (Date.now() - startedAtRef.current);
      setElapsedMs(total);
      if (total >= maxDurationMs) {
        accumulatedRef.current = total;
        setError({ kind: 'limit-reached', minutes: Math.round(maxDurationMs / 60000) });
        stop();
      }
    }, 200);

    peakTimerRef.current = setInterval(() => {
      setPeaks((previous) => {
        const next = [...previous, currentLevelRef.current];
        peaksRef.current = next;
        return next;
      });
    }, PEAK_INTERVAL_MS);

    recorder.start(250);
    setStatus('recording');
  }, [maxDurationMs, readLevel, stop, teardown]);

  const pause = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'recording') return;
    recorder.pause();
    accumulatedRef.current += Date.now() - startedAtRef.current;
    if (tickRef.current) clearInterval(tickRef.current);
    if (peakTimerRef.current) clearInterval(peakTimerRef.current);
    tickRef.current = null;
    peakTimerRef.current = null;
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== 'paused') return;
    recorder.resume();
    startedAtRef.current = Date.now();

    tickRef.current = setInterval(() => {
      const total = accumulatedRef.current + (Date.now() - startedAtRef.current);
      setElapsedMs(total);
      if (total >= maxDurationMs) {
        accumulatedRef.current = total;
        setError({ kind: 'limit-reached', minutes: Math.round(maxDurationMs / 60000) });
        stop();
      }
    }, 200);

    peakTimerRef.current = setInterval(() => {
      setPeaks((previous) => {
        const next = [...previous, currentLevelRef.current];
        peaksRef.current = next;
        return next;
      });
    }, PEAK_INTERVAL_MS);

    setStatus('recording');
  }, [maxDurationMs, stop]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      teardown();
      setStatus('idle');
    }
    setElapsedMs(0);
    setPeaks([]);
    peaksRef.current = [];
  }, [teardown]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setElapsedMs(0);
    setPeaks([]);
    peaksRef.current = [];
    accumulatedRef.current = 0;
  }, []);

  // A pause must survive the moment the recorder stops on its own.
  useEffect(() => {
    if (status !== 'recording') return;
    const handler = () => {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = Date.now();
    };
    window.addEventListener('pagehide', handler);
    return () => window.removeEventListener('pagehide', handler);
  }, [status]);

  return {
    status,
    error,
    elapsedMs,
    level,
    peaks,
    isActive: status === 'recording' || status === 'paused',
    start,
    pause,
    resume,
    stop,
    cancel,
    reset,
    clearError: () => setError(null),
  };
}
