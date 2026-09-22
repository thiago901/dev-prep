import type { Content, ContentProgress, LearningPath } from './types';
import { activityKindDef, activityKindOf } from './activity';

/**
 * Where you are inside a path.
 *
 * A step counts as done once it has been worked through — answered, or read
 * and acknowledged. Not once it has been opened, and not once it has been
 * "mastered". Paths teach; the review schedule is what decides whether
 * something stuck.
 *
 * The distinction matters because a learn step records no attempt: nothing was
 * asked, so there is nothing to attempt. Counting only attempts left every
 * reading step permanently pending, which stalled the whole path on step one.
 */

export interface PathStep {
  content: Content;
  done: boolean;
  /** The first step that is not done yet. */
  current: boolean;
}

export interface PathProgress {
  path: LearningPath;
  steps: PathStep[];
  doneCount: number;
  total: number;
  /** The item to open when the user presses continue. Null when finished. */
  next: Content | null;
  /** Position of `next` in the path, 1-based. Equals total when finished. */
  position: number;
  minutesLeft: number;
  started: boolean;
  complete: boolean;
}

/**
 * Has this step been worked through?
 *
 * `revealedCount` is the one counter every activity moves: answering bumps it,
 * and so does a learn card's "got it". Attempts alone miss reading steps.
 */
export function stepDone(progress: ContentProgress | undefined): boolean {
  if (!progress) return false;
  return progress.attempts > 0 || progress.revealedCount > 0;
}

export function pathProgress(
  path: LearningPath,
  contentById: Map<string, Content>,
  progressById: Record<string, ContentProgress | undefined>,
): PathProgress {
  const steps: PathStep[] = [];
  let seenCurrent = false;

  for (const stepId of path.stepIds) {
    const content = contentById.get(stepId);
    if (!content) continue;
    const done = stepDone(progressById[stepId]);
    const current = !done && !seenCurrent;
    if (current) seenCurrent = true;
    steps.push({ content, done, current });
  }

  const doneCount = steps.filter((step) => step.done).length;
  const currentStep = steps.find((step) => step.current) ?? null;
  const minutesLeft = steps
    .filter((step) => !step.done)
    .reduce((total, step) => total + activityKindDef(activityKindOf(step.content)).minutes, 0);

  return {
    path,
    steps,
    doneCount,
    total: steps.length,
    next: currentStep?.content ?? null,
    position: currentStep ? steps.indexOf(currentStep) + 1 : steps.length,
    minutesLeft: Math.max(1, Math.round(minutesLeft)),
    started: doneCount > 0,
    complete: steps.length > 0 && doneCount === steps.length,
  };
}

/**
 * The path to offer on the home screen.
 *
 * A started-but-unfinished path always wins: finishing something beats
 * starting something. Otherwise the shortest unstarted one, because the first
 * path somebody runs should end.
 */
export function recommendPath(all: PathProgress[]): PathProgress | null {
  const inProgress = all.filter((entry) => entry.started && !entry.complete);
  if (inProgress.length > 0) {
    return inProgress.sort((a, b) => b.doneCount / b.total - a.doneCount / a.total)[0] ?? null;
  }
  const fresh = all.filter((entry) => !entry.started);
  if (fresh.length > 0) {
    return fresh.sort((a, b) => a.minutesLeft - b.minutesLeft)[0] ?? null;
  }
  return all[0] ?? null;
}
