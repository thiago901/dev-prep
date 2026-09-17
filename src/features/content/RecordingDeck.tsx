import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LuCircle,
  LuEar,
  LuMic,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuSquare,
  LuStar,
  LuTrash2,
} from 'react-icons/lu';
import type { Attempt, Locale } from '@/domain/types';
import { cn, formatDateTime, formatDuration } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { useRecorder, isRecordingSupported, type RecordedTake } from '@/hooks/useRecorder';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { Counter, LevelMeter, Waveform } from '@/components/lab/Meters';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton, TransportRow } from '@/components/lab/Transport';

/**
 * The attempt gate.
 *
 * Channel one is the user's take. Channel two — the model answer — is visibly
 * inert until channel one has signal. That is not a UI convention the screen
 * could forget: the reveal control below is disabled until an attempt exists,
 * and the only way past it is an explicit, logged choice.
 */

export interface RecordingDeckProps {
  attempts: Attempt[];
  answerLocale: Locale;
  maxDurationMs: number;
  onSaveTake: (take: RecordedTake, locale: Locale) => Promise<void>;
  onSilentAttempt: () => Promise<void>;
  onDeleteAttempt: (attemptId: string) => Promise<void>;
  onToggleStar: (attemptId: string) => Promise<void>;
  getRecordingUrl: (recordingId: string) => Promise<string | null>;
  /** Hides the take history, used inside a mock interview round. */
  compact?: boolean;
  /**
   * Puts keyboard focus on the record key when the deck mounts. Used when the
   * user arrived by pressing a record key elsewhere, so the next press records.
   */
  autoFocusRecord?: boolean;
}

export function RecordingDeck({
  attempts,
  answerLocale,
  maxDurationMs,
  onSaveTake,
  onSilentAttempt,
  onDeleteAttempt,
  onToggleStar,
  getRecordingUrl,
  compact = false,
  autoFocusRecord = false,
}: RecordingDeckProps) {
  const { t, locale } = useI18n();
  const [pendingTake, setPendingTake] = useState<RecordedTake | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSilentHelp, setShowSilentHelp] = useState(false);

  const recordKeyRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (autoFocusRecord) recordKeyRef.current?.focus({ preventScroll: true });
  }, [autoFocusRecord]);

  const recorder = useRecorder({
    maxDurationMs,
    onComplete: (take) => setPendingTake(take),
  });

  const supported = isRecordingSupported();

  const keepTake = useCallback(async () => {
    if (!pendingTake) return;
    setSaving(true);
    try {
      await onSaveTake(pendingTake, answerLocale);
      setPendingTake(null);
      recorder.reset();
    } finally {
      setSaving(false);
    }
  }, [pendingTake, onSaveTake, answerLocale, recorder]);

  const discardTake = useCallback(() => {
    setPendingTake(null);
    recorder.reset();
  }, [recorder]);

  const errorCopy = recorder.error
    ? {
        denied: { title: t('mic.denied.title'), body: t('mic.denied.body') },
        unsupported: { title: t('mic.unsupported.title'), body: t('mic.unsupported.body') },
        'missing-device': { title: t('mic.missing.title'), body: t('mic.missing.body') },
        failed: { title: t('mic.failed.title'), body: t('mic.failed.body') },
        'limit-reached': {
          title: t('mic.limit.title'),
          body: t('mic.limit.body', {
            minutes: recorder.error.kind === 'limit-reached' ? recorder.error.minutes : 0,
          }),
        },
      }[recorder.error.kind]
    : null;

  return (
    <Panel className="overflow-hidden" aria-labelledby="take-heading">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Legend id="take-heading" lit={recorder.status === 'recording'}>
          {t('attempt.title')}
        </Legend>
        <span className="flex items-center gap-2">
          {recorder.status === 'recording' ? (
            <>
              <Lamp tone="record" rolling size="md" />
              <span className="legend-type text-record-ink">{t('attempt.recording')}</span>
            </>
          ) : recorder.status === 'paused' ? (
            <>
              <Lamp tone="brass" size="md" />
              <span className="legend-type text-brass">{t('attempt.paused')}</span>
            </>
          ) : null}
        </span>
      </div>

      <PanelRule />

      {/* --- channel one: the user's take ---------------------------------- */}
      <div className="px-4 py-5">
        {recorder.isActive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Counter ms={recorder.elapsedMs} tone="record" className="text-prompt" />
              <LevelMeter
                value={recorder.level}
                tone="record"
                className="flex-1"
                label={t('attempt.recording')}
              />
            </div>
            <Waveform peaks={recorder.peaks} live tone="record" />
          </div>
        ) : pendingTake ? (
          <PendingTake take={pendingTake} />
        ) : (
          <p className="max-w-read text-body text-legend-2">{t('attempt.prompt')}</p>
        )}

        {errorCopy ? (
          <div
            role="alert"
            className="mt-4 rounded-panel border border-record/35 bg-record/[0.07] p-4"
          >
            <p className="legend-type mb-1.5 text-record-ink">{errorCopy.title}</p>
            <p className="max-w-read text-body text-legend-2">{errorCopy.body}</p>
          </div>
        ) : null}

        {showSilentHelp ? (
          <div className="mt-4 rounded-panel border border-channel2/35 bg-channel2/[0.06] p-4">
            <p className="max-w-read text-body text-legend-2">{t('attempt.silent.help')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TransportButton
                size="sm"
                variant="primary"
                onClick={async () => {
                  await onSilentAttempt();
                  setShowSilentHelp(false);
                }}
              >
                {t('attempt.silent.confirm')}
              </TransportButton>
              <TransportButton size="sm" variant="quiet" onClick={() => setShowSilentHelp(false)}>
                {t('action.cancel')}
              </TransportButton>
            </div>
          </div>
        ) : null}
      </div>

      {/* --- the transport row. It never moves between states. -------------- */}
      <TransportRow>
        {recorder.status === 'recording' ? (
          <>
            <TransportButton
              variant="neutral"
              icon={<LuPause />}
              onClick={recorder.pause}
              size="lg"
            >
              {t('attempt.pause')}
            </TransportButton>
            <TransportButton variant="record" icon={<LuSquare />} onClick={recorder.stop} size="lg">
              {t('attempt.stop')}
            </TransportButton>
            <TransportButton variant="quiet" onClick={recorder.cancel}>
              {t('attempt.discard')}
            </TransportButton>
          </>
        ) : recorder.status === 'paused' ? (
          <>
            <TransportButton
              variant="record"
              icon={<LuCircle />}
              onClick={recorder.resume}
              size="lg"
            >
              {t('attempt.resume')}
            </TransportButton>
            <TransportButton variant="neutral" icon={<LuSquare />} onClick={recorder.stop} size="lg">
              {t('attempt.stop')}
            </TransportButton>
            <TransportButton variant="quiet" onClick={recorder.cancel}>
              {t('attempt.discard')}
            </TransportButton>
          </>
        ) : pendingTake ? (
          <>
            <TransportButton
              variant="primary"
              size="lg"
              onClick={keepTake}
              disabled={saving}
            >
              {saving ? t('common.loading') : t('attempt.keep')}
            </TransportButton>
            <TransportButton variant="neutral" icon={<LuRotateCcw />} onClick={discardTake}>
              {t('attempt.again')}
            </TransportButton>
          </>
        ) : (
          <>
            <TransportButton
              variant="record"
              size="lg"
              icon={<LuMic />}
              ref={recordKeyRef}
              onClick={recorder.start}
              disabled={!supported || recorder.status === 'requesting'}
            >
              {recorder.status === 'requesting' ? t('common.loading') : t('attempt.record')}
            </TransportButton>
            <TransportButton
              variant="quiet"
              icon={<LuEar />}
              onClick={() => setShowSilentHelp((previous) => !previous)}
              aria-pressed={showSilentHelp}
            >
              {t('attempt.silent')}
            </TransportButton>
          </>
        )}
      </TransportRow>

      {/* --- the take sheet ------------------------------------------------- */}
      {!compact && attempts.length > 0 ? (
        <div className="border-t border-rule">
          <div className="px-4 py-3">
            <Legend>{t('attempt.history')}</Legend>
          </div>
          <ul>
            {attempts.map((attempt, position) => (
              <TakeRow
                key={attempt.id}
                attempt={attempt}
                number={position + 1}
                isLatest={position === attempts.length - 1}
                locale={locale}
                getRecordingUrl={getRecordingUrl}
                onDelete={() => onDeleteAttempt(attempt.id)}
                onToggleStar={() => onToggleStar(attempt.id)}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

function PendingTake({ take }: { take: RecordedTake }) {
  const { t } = useI18n();
  const [url, setUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(take.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [take.blob]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <TransportButton
          variant="neutral"
          size="sm"
          icon={playing ? <LuPause /> : <LuPlay />}
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            if (playing) {
              audio.pause();
            } else {
              void audio.play();
            }
          }}
          aria-label={playing ? t('attempt.pausePlayback') : t('attempt.play')}
        >
          {playing ? t('attempt.pausePlayback') : t('attempt.play')}
        </TransportButton>
        <Counter ms={take.durationMs} className="text-body-lg" />
      </div>

      <Waveform peaks={take.peaks} tone="brass" />

      {url ? (
        <audio
          ref={audioRef}
          src={url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="sr-only"
        />
      ) : null}
    </div>
  );
}

function TakeRow({
  attempt,
  number,
  isLatest,
  locale,
  getRecordingUrl,
  onDelete,
  onToggleStar,
}: {
  attempt: Attempt;
  number: number;
  isLatest: boolean;
  locale: Locale;
  getRecordingUrl: (recordingId: string) => Promise<string | null>;
  onDelete: () => Promise<void>;
  onToggleStar: () => Promise<void>;
}) {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const play = async () => {
    if (!attempt.recordingId) return;

    if (!url) {
      const resolved = await getRecordingUrl(attempt.recordingId);
      if (!resolved) return;
      setUrl(resolved);
      // The element needs the src before play can be called on it.
      requestAnimationFrame(() => void audioRef.current?.play());
      return;
    }

    if (playing) audioRef.current?.pause();
    else void audioRef.current?.play();
  };

  return (
    <li className="border-t border-rule/60 px-4 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="legend-type w-[4.5rem] shrink-0" data-tabular>
          {t('attempt.take', { number })}
        </span>

        {attempt.recordingId ? (
          <TransportButton
            variant="quiet"
            size="sm"
            icon={playing ? <LuPause /> : <LuPlay />}
            onClick={play}
            aria-label={playing ? t('attempt.pausePlayback') : t('attempt.play')}
          />
        ) : (
          <span className="legend-type text-channel2">{t('attempt.silent')}</span>
        )}

        <Counter ms={attempt.durationMs} tone="muted" className="text-meta" />

        <time
          dateTime={attempt.createdAt}
          className="text-meta text-legend-3"
          data-tabular
        >
          {formatDateTime(attempt.createdAt, locale)}
        </time>

        {attempt.estimatedWords ? (
          <span className="text-meta text-legend-3">
            {t('attempt.words', { count: attempt.estimatedWords })}
          </span>
        ) : null}

        {isLatest ? <span className="legend-type text-brass">{t('attempt.latest')}</span> : null}

        <span className="ml-auto flex items-center gap-1">
          <TransportButton
            variant="quiet"
            size="sm"
            onClick={onToggleStar}
            aria-pressed={attempt.starred}
            aria-label={attempt.starred ? t('attempt.unstar') : t('attempt.star')}
            title={attempt.starred ? t('attempt.starred') : t('attempt.star')}
            icon={
              <LuStar
                className={cn(attempt.starred ? 'fill-brass text-brass' : 'text-legend-3')}
              />
            }
          />
          <TransportButton
            variant="quiet"
            size="sm"
            onClick={() => setConfirming(true)}
            aria-label={t('action.delete')}
            icon={<LuTrash2 />}
          />
        </span>
      </div>

      {confirming ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-control border border-record/35 bg-record/[0.06] px-3 py-2.5">
          <p className="mr-auto text-meta text-legend-2">{t('attempt.delete.confirm')}</p>
          <TransportButton
            size="sm"
            variant="danger"
            onClick={async () => {
              await onDelete();
              setConfirming(false);
            }}
          >
            {t('action.delete')}
          </TransportButton>
          <TransportButton size="sm" variant="quiet" onClick={() => setConfirming(false)}>
            {t('action.cancel')}
          </TransportButton>
        </div>
      ) : null}

      {url ? (
        <audio
          ref={audioRef}
          src={url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="sr-only"
        />
      ) : null}
    </li>
  );
}

export { formatDuration };
