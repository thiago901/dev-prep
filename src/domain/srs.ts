import type { AttemptMode, Confidence, ContentProgress, SrsState } from './types';

/**
 * Review scheduling.
 *
 * Deliberately simple: an SM-2 shaped interval walk driven by the three
 * confidence answers the user gives after hearing the model answer. The point
 * is not scheduling precision, it is that the product keeps handing back the
 * questions the user could not yet answer out loud.
 *
 * One rule this product adds: revealing the answer without having attempted it
 * never advances the schedule. Reading is not practising.
 */

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const DEFAULT_EASE = 2.3;

/** A question is only mastered after it survived a long gap more than once. */
const MASTERY_INTERVAL_DAYS = 21;
const MASTERY_MIN_REPS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function createProgress(contentId: string): ContentProgress {
  return {
    contentId,
    srsState: 'new',
    intervalDays: 0,
    ease: DEFAULT_EASE,
    dueAt: null,
    lastSeenAt: null,
    reps: 0,
    lapses: 0,
    attempts: 0,
    spokenAttempts: 0,
    silentAttempts: 0,
    revealedCount: 0,
    lastConfidence: null,
    spokenMs: 0,
  };
}

function clampEase(value: number): number {
  return Math.min(MAX_EASE, Math.max(MIN_EASE, value));
}

function nextState(progress: ContentProgress, intervalDays: number): SrsState {
  if (intervalDays >= MASTERY_INTERVAL_DAYS && progress.reps + 1 >= MASTERY_MIN_REPS) {
    return 'mastered';
  }
  if (intervalDays >= 1) return 'review';
  return 'learning';
}

export interface GradeOptions {
  confidence: Confidence;
  /** False when the user revealed without attempting; the schedule holds. */
  attempted: boolean;
  now?: Date;
}

/**
 * Applies one graded review to a progress record and returns a new one.
 * Pure: no dates read from the ambient clock unless `now` is omitted.
 */
export function gradeProgress(
  progress: ContentProgress,
  { confidence, attempted, now = new Date() }: GradeOptions,
): ContentProgress {
  const nowIso = now.toISOString();

  // Reading the answer without trying to say it is tracked, but it never
  // buys the user a longer interval.
  if (!attempted) {
    return {
      ...progress,
      lastSeenAt: nowIso,
      revealedCount: progress.revealedCount + 1,
      srsState: progress.srsState === 'new' ? 'learning' : progress.srsState,
      dueAt: progress.dueAt ?? new Date(now.getTime() + DAY_MS).toISOString(),
    };
  }

  let { ease, intervalDays, reps, lapses } = progress;

  switch (confidence) {
    case 'easy':
      // Too easy: skip ahead, so it stops taking practice time from things
      // the user cannot answer yet.
      ease = clampEase(ease + 0.15);
      intervalDays = intervalDays === 0 ? 4 : Math.round(intervalDays * (ease + 0.4));
      reps += 1;
      break;

    case 'known':
      ease = clampEase(ease + 0.1);
      intervalDays = intervalDays === 0 ? 2 : Math.round(intervalDays * ease);
      reps += 1;
      break;

    case 'partial':
      ease = clampEase(ease - 0.12);
      intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.25));
      reps += 1;
      break;

    case 'unknown':
    default:
      ease = clampEase(ease - 0.25);
      // Back to the front of the queue, but not to zero history.
      intervalDays = 0;
      lapses += 1;
      reps = 0;
      break;
  }

  // A same-day retry for anything the user could not answer.
  const dueAt = new Date(
    now.getTime() + (intervalDays === 0 ? 10 * 60 * 1000 : intervalDays * DAY_MS),
  ).toISOString();

  const updated: ContentProgress = {
    ...progress,
    ease,
    intervalDays,
    reps,
    lapses,
    dueAt,
    lastSeenAt: nowIso,
    lastConfidence: confidence,
    revealedCount: progress.revealedCount + 1,
  };

  updated.srsState = confidence === 'unknown' ? 'learning' : nextState(progress, intervalDays);

  return updated;
}

/** Records an attempt without grading it; grading happens after the reveal. */
export function recordAttempt(
  progress: ContentProgress,
  mode: AttemptMode,
  durationMs: number,
  now = new Date(),
): ContentProgress {
  return {
    ...progress,
    attempts: progress.attempts + 1,
    spokenAttempts: progress.spokenAttempts + (mode === 'spoken' ? 1 : 0),
    silentAttempts: progress.silentAttempts + (mode === 'spoken' ? 0 : 1),
    spokenMs: progress.spokenMs + (mode === 'spoken' ? durationMs : 0),
    lastSeenAt: now.toISOString(),
    srsState: progress.srsState === 'new' ? 'learning' : progress.srsState,
  };
}

export function isDue(progress: ContentProgress | undefined, now = new Date()): boolean {
  if (!progress) return false;
  if (progress.srsState === 'new') return false;
  if (!progress.dueAt) return false;
  return new Date(progress.dueAt).getTime() <= now.getTime();
}

/** Negative when overdue. Null for items that were never started. */
export function daysUntilDue(
  progress: ContentProgress | undefined,
  now = new Date(),
): number | null {
  if (!progress?.dueAt) return null;
  return Math.round((new Date(progress.dueAt).getTime() - now.getTime()) / DAY_MS);
}

export const SRS_STATE_ORDER: readonly SrsState[] = [
  'new',
  'learning',
  'review',
  'mastered',
] as const;

/** How much a state contributes to a skill level. Mastery is the only 1. */
export function stateWeight(state: SrsState): number {
  switch (state) {
    case 'mastered':
      return 1;
    case 'review':
      return 0.6;
    case 'learning':
      return 0.25;
    case 'new':
    default:
      return 0;
  }
}
