import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Attempt,
  AttemptMode,
  Confidence,
  Content,
  ContentProgress,
  Locale,
  MockInterview,
  Recording,
  UserProfile,
} from '@/domain/types';
import { createProgress, gradeProgress, recordAttempt as applyAttempt } from '@/domain/srs';
import { buildIndex, type StudyIndex } from '@/domain/selectors';
import { entitlementsFor } from '@/domain/entitlements';
import {
  DEFAULT_PRACTICE_PREFERENCES,
  createSessionFromPlan,
  generatePracticeSession,
  localDayKey,
  type PracticePreferences,
  type PracticeReason,
  type PracticeSession,
  type PracticeSize,
} from '@/domain/practice';
import { EMPTY_SNAPSHOT, repositories, type StudySnapshot } from '@/data';
import { createId, estimateWords } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import { useSettings } from './SettingsProvider';

/**
 * The study store.
 *
 * Content and everything the user has produced, held together so screens read
 * one consistent view. Writes go to the repository and to local state at the
 * same time: the UI must never wait on storage to acknowledge a take.
 */

interface StudyValue {
  ready: boolean;
  loadError: boolean;
  index: StudyIndex;
  snapshot: StudySnapshot;
  entitlements: ReturnType<typeof entitlementsFor>;
  reload: () => Promise<void>;

  saveAttempt: (input: SaveAttemptInput) => Promise<Attempt>;
  grade: (contentId: string, confidence: Confidence, attempted: boolean) => Promise<void>;
  markRevealedWithoutAttempt: (contentId: string) => Promise<void>;
  deleteAttempt: (attemptId: string) => Promise<void>;
  toggleStarred: (attemptId: string) => Promise<void>;
  toggleFavorite: (contentId: string) => Promise<void>;
  saveMock: (mock: MockInterview) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  clearEverything: () => Promise<void>;

  /** Resolves an object URL for playback, cached for the session. */
  getRecordingUrl: (recordingId: string) => Promise<string | null>;
  storageUsedBytes: number;

  // --- Today's Practice ----------------------------------------------------
  practicePreferences: PracticePreferences;
  savePracticePreferences: (preferences: PracticePreferences) => Promise<void>;
  /** Most recent first. */
  practiceSessions: PracticeSession[];
  /** The latest session created today, finished or not. */
  todaySession: PracticeSession | null;
  /** The plan a session of this size would get right now, without saving it. */
  planPractice: (size: PracticeSize) => Array<{ content: Content; reason: PracticeReason }>;
  startPractice: (size: PracticeSize) => Promise<PracticeSession | null>;
  savePracticeSession: (session: PracticeSession) => Promise<void>;
}

export interface SaveAttemptInput {
  contentId: string;
  mode: AttemptMode;
  locale: Locale;
  durationMs: number;
  /** The typed answer, for written attempts. */
  writtenAnswer?: string;
  blob?: Blob;
  peaks?: number[];
}

const StudyContext = createContext<StudyValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { answerLocale } = useSettings();

  const [content, setContent] = useState<Content[]>([]);
  const [snapshot, setSnapshot] = useState<StudySnapshot>(EMPTY_SNAPSHOT);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);

  // Object URLs are revoked on unmount; recreating them per playback would
  // leak and would restart the audio element unnecessarily.
  const urlCache = useRef(new Map<string, string>());
  const peaksCache = useRef(new Map<string, number[]>());

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const [loadedContent, loadedSnapshot] = await Promise.all([
        repositories.content.list(),
        repositories.study.load(),
      ]);
      setContent(loadedContent);
      setSnapshot(loadedSnapshot);
      void repositories.recordings.usedBytes().then(setStorageUsedBytes);
    } catch {
      setLoadError(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, user?.uid, load]);

  useEffect(() => {
    const cache = urlCache.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  const index = useMemo(
    () => buildIndex(content, snapshot.progress, snapshot.attempts, snapshot.favorites),
    [content, snapshot.progress, snapshot.attempts, snapshot.favorites],
  );

  const entitlements = useMemo(
    // Plan resolution moves to the subscription document once billing exists;
    // until then everyone is on the free tier and the limits are real.
    () => entitlementsFor('free'),
    [],
  );

  const progressFor = useCallback(
    (contentId: string): ContentProgress =>
      snapshot.progress[contentId] ?? createProgress(contentId),
    [snapshot.progress],
  );

  const saveAttempt = useCallback(
    async (input: SaveAttemptInput): Promise<Attempt> => {
      const attemptId = createId('att_');
      let recordingId: string | null = null;

      if (input.blob && input.mode === 'spoken') {
        recordingId = createId('rec_');
        const recording: Recording = {
          id: recordingId,
          attemptId,
          contentId: input.contentId,
          createdAt: new Date().toISOString(),
          durationMs: input.durationMs,
          mimeType: input.blob.type || 'audio/webm',
          sizeBytes: input.blob.size,
          locale: input.locale,
          storagePath: null,
        };

        if (input.peaks?.length) peaksCache.current.set(recordingId, input.peaks);

        await repositories.recordings.put(recordingId, input.blob);
        await repositories.study.saveRecording(recording);
        setSnapshot((previous) => ({
          ...previous,
          recordings: [recording, ...previous.recordings],
        }));
        void repositories.recordings.usedBytes().then(setStorageUsedBytes);
      }

      const attempt: Attempt = {
        id: attemptId,
        contentId: input.contentId,
        createdAt: new Date().toISOString(),
        mode: input.mode,
        locale: input.locale,
        durationMs: input.durationMs,
        recordingId,
        confidence: null,
        ...(input.writtenAnswer ? { writtenAnswer: input.writtenAnswer } : {}),
        revealed: false,
        starred: false,
        estimatedWords:
          input.mode === 'spoken'
            ? estimateWords(input.durationMs)
            : input.writtenAnswer
              ? input.writtenAnswer.trim().split(/\s+/).length
              : undefined,
      };

      const nextProgress = applyAttempt(progressFor(input.contentId), input.mode, input.durationMs);

      await Promise.all([
        repositories.study.saveAttempt(attempt),
        repositories.study.saveProgress(nextProgress),
      ]);

      setSnapshot((previous) => ({
        ...previous,
        attempts: [attempt, ...previous.attempts],
        progress: { ...previous.progress, [input.contentId]: nextProgress },
      }));

      return attempt;
    },
    [progressFor],
  );

  const grade = useCallback(
    async (contentId: string, confidence: Confidence, attempted: boolean) => {
      const next = gradeProgress(progressFor(contentId), { confidence, attempted });
      await repositories.study.saveProgress(next);
      setSnapshot((previous) => ({
        ...previous,
        progress: { ...previous.progress, [contentId]: next },
      }));
    },
    [progressFor],
  );

  const markRevealedWithoutAttempt = useCallback(
    async (contentId: string) => {
      const next = gradeProgress(progressFor(contentId), {
        confidence: 'unknown',
        attempted: false,
      });
      await repositories.study.saveProgress(next);
      setSnapshot((previous) => ({
        ...previous,
        progress: { ...previous.progress, [contentId]: next },
      }));
    },
    [progressFor],
  );

  const deleteAttempt = useCallback(
    async (attemptId: string) => {
      const attempt = snapshot.attempts.find((item) => item.id === attemptId);
      if (attempt?.recordingId) {
        await repositories.recordings.delete(attempt.recordingId);
        await repositories.study.deleteRecording(attempt.recordingId);
        const url = urlCache.current.get(attempt.recordingId);
        if (url) {
          URL.revokeObjectURL(url);
          urlCache.current.delete(attempt.recordingId);
        }
      }
      await repositories.study.deleteAttempt(attemptId);
      setSnapshot((previous) => ({
        ...previous,
        attempts: previous.attempts.filter((item) => item.id !== attemptId),
        recordings: previous.recordings.filter((item) => item.attemptId !== attemptId),
      }));
      void repositories.recordings.usedBytes().then(setStorageUsedBytes);
    },
    [snapshot.attempts],
  );

  const toggleStarred = useCallback(
    async (attemptId: string) => {
      const attempt = snapshot.attempts.find((item) => item.id === attemptId);
      if (!attempt) return;

      // Only one take per question can be the best one; starring a second
      // clears the first, the way a studio circles exactly one take.
      const siblings = snapshot.attempts.filter(
        (item) => item.contentId === attempt.contentId && item.starred && item.id !== attemptId,
      );

      const updated: Attempt = { ...attempt, starred: !attempt.starred };
      const cleared = siblings.map((item) => ({ ...item, starred: false }));

      await Promise.all([
        repositories.study.saveAttempt(updated),
        ...cleared.map((item) => repositories.study.saveAttempt(item)),
      ]);

      setSnapshot((previous) => ({
        ...previous,
        attempts: previous.attempts.map((item) => {
          if (item.id === updated.id) return updated;
          const clearedMatch = cleared.find((entry) => entry.id === item.id);
          return clearedMatch ?? item;
        }),
      }));
    },
    [snapshot.attempts],
  );

  const toggleFavorite = useCallback(
    async (contentId: string) => {
      const next = snapshot.favorites.includes(contentId)
        ? snapshot.favorites.filter((id) => id !== contentId)
        : [...snapshot.favorites, contentId];
      await repositories.study.setFavorites(next);
      setSnapshot((previous) => ({ ...previous, favorites: next }));
    },
    [snapshot.favorites],
  );

  const saveMock = useCallback(async (mock: MockInterview) => {
    await repositories.study.saveMockInterview(mock);
    setSnapshot((previous) => ({
      ...previous,
      mockInterviews: [mock, ...previous.mockInterviews.filter((item) => item.id !== mock.id)],
    }));
  }, []);

  const saveProfile = useCallback(async (profile: UserProfile) => {
    await repositories.study.saveProfile(profile);
    setSnapshot((previous) => ({ ...previous, profile }));
  }, []);

  const clearEverything = useCallback(async () => {
    await repositories.study.clear();
    await repositories.recordings.clear();
    urlCache.current.forEach((url) => URL.revokeObjectURL(url));
    urlCache.current.clear();
    peaksCache.current.clear();
    setSnapshot(EMPTY_SNAPSHOT);
    setStorageUsedBytes(0);
  }, []);

  // --- Today's Practice ----------------------------------------------------

  const practicePreferences = useMemo<PracticePreferences>(() => {
    const stored = snapshot.practicePreferences;
    if (stored) return { ...DEFAULT_PRACTICE_PREFERENCES, ...stored };
    // Until the user sets practice stacks, the profile's stacks are the best
    // evidence of what they want to be asked about.
    return { ...DEFAULT_PRACTICE_PREFERENCES, stackIds: snapshot.profile?.stackIds ?? [] };
  }, [snapshot.practicePreferences, snapshot.profile]);

  const savePracticePreferences = useCallback(async (preferences: PracticePreferences) => {
    await repositories.study.savePracticePreferences(preferences);
    setSnapshot((previous) => ({ ...previous, practicePreferences: preferences }));
  }, []);

  const todaySession = useMemo(() => {
    const today = localDayKey();
    return snapshot.practiceSessions.find((session) => session.day === today) ?? null;
  }, [snapshot.practiceSessions]);

  const planPractice = useCallback(
    (size: PracticeSize) => {
      const today = localDayKey();
      const sessionsToday = snapshot.practiceSessions.filter((session) => session.day === today).length;
      return generatePracticeSession(index, {
        size,
        preferences: practicePreferences,
        recentSessions: snapshot.practiceSessions,
        answerLocale,
        // Stable within a day and a preference set, so the plan explained on
        // the Home screen is the session that starts when you press Start.
        seed: [today, size, sessionsToday, JSON.stringify(practicePreferences)].join('|'),
      });
    },
    [index, practicePreferences, snapshot.practiceSessions, answerLocale],
  );

  const savePracticeSession = useCallback(async (session: PracticeSession) => {
    setSnapshot((previous) => ({
      ...previous,
      practiceSessions: [session, ...previous.practiceSessions.filter((item) => item.id !== session.id)],
    }));
    await repositories.study.savePracticeSession(session);
  }, []);

  const startPractice = useCallback(
    async (size: PracticeSize) => {
      const plan = planPractice(size);
      if (plan.length === 0) return null;
      const session = createSessionFromPlan(plan, size, createId('prc_'));
      await savePracticeSession(session);
      return session;
    },
    [planPractice, savePracticeSession],
  );

  const getRecordingUrl = useCallback(async (recordingId: string) => {
    const cached = urlCache.current.get(recordingId);
    if (cached) return cached;

    const blob = await repositories.recordings.get(recordingId);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    urlCache.current.set(recordingId, url);
    return url;
  }, []);

  const value = useMemo<StudyValue>(
    () => ({
      ready,
      loadError,
      index,
      snapshot,
      entitlements,
      reload: load,
      saveAttempt,
      grade,
      markRevealedWithoutAttempt,
      deleteAttempt,
      toggleStarred,
      toggleFavorite,
      saveMock,
      saveProfile,
      clearEverything,
      getRecordingUrl,
      storageUsedBytes,
      practicePreferences,
      savePracticePreferences,
      practiceSessions: snapshot.practiceSessions,
      todaySession,
      planPractice,
      startPractice,
      savePracticeSession,
    }),
    [
      practicePreferences,
      savePracticePreferences,
      todaySession,
      planPractice,
      startPractice,
      savePracticeSession,
      ready,
      loadError,
      index,
      snapshot,
      entitlements,
      load,
      saveAttempt,
      grade,
      markRevealedWithoutAttempt,
      deleteAttempt,
      toggleStarred,
      toggleFavorite,
      saveMock,
      saveProfile,
      clearEverything,
      getRecordingUrl,
      storageUsedBytes,
    ],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyValue {
  const value = useContext(StudyContext);
  if (!value) throw new Error('useStudy must be used inside StudyProvider.');
  return value;
}
