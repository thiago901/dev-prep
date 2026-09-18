import type { ActivityKind, Content, ResponseMode } from './types';

/**
 * The ladder.
 *
 * Learn → Recognise → Decide → Apply → Explain → Say it out loud. Every
 * activity kind sits on one rung, and the rung decides three things: how the
 * user answers, whether a microphone is offered at all, and where the item is
 * allowed to appear in a session or a path.
 *
 * Nothing here is cosmetic. `level` orders a path and ramps a practice
 * session; `responseMode` is the single switch that stopped the product from
 * asking for a recording in front of every fact.
 */

export type ActivityLevel = 1 | 2 | 3 | 4 | 5;

export interface ActivityKindDef {
  id: ActivityKind;
  level: ActivityLevel;
  responseMode: ResponseMode;
  /** True when the work of the activity is a spoken interview answer. */
  speaking: boolean;
  /** Roughly how long one rep takes, in minutes. */
  minutes: number;
}

export const ACTIVITY_KINDS: readonly ActivityKindDef[] = [
  { id: 'learn', level: 1, responseMode: 'read', speaking: false, minutes: 3 },
  { id: 'quick-check', level: 2, responseMode: 'select', speaking: false, minutes: 1.5 },
  { id: 'decision', level: 3, responseMode: 'select', speaking: false, minutes: 2 },
  { id: 'multiple-choice', level: 3, responseMode: 'select', speaking: false, minutes: 1.5 },
  { id: 'code-reading', level: 4, responseMode: 'write', speaking: false, minutes: 3 },
  { id: 'find-the-bug', level: 4, responseMode: 'write', speaking: false, minutes: 3 },
  { id: 'written', level: 4, responseMode: 'write', speaking: false, minutes: 3 },
  { id: 'architecture', level: 5, responseMode: 'speak', speaking: true, minutes: 5 },
  { id: 'interview', level: 5, responseMode: 'speak', speaking: true, minutes: 4 },
  { id: 'speaking', level: 5, responseMode: 'speak', speaking: true, minutes: 3 },
  { id: 'challenge', level: 5, responseMode: 'write', speaking: false, minutes: 6 },
] as const;

const BY_ID = new Map(ACTIVITY_KINDS.map((kind) => [kind.id, kind]));

export function activityKindDef(kind: ActivityKind): ActivityKindDef {
  return BY_ID.get(kind) ?? BY_ID.get('interview')!;
}

/**
 * Resolves what an item asks of the user.
 *
 * Authored kinds win. Otherwise the blocks decide — a decision block is a
 * decision no matter what the item calls itself — and only then the content
 * type. The fallback exists so the original bank kept working unedited.
 */
export function activityKindOf(content: Content): ActivityKind {
  if (content.activityKind) return content.activityKind;

  const has = (kind: string) => content.blocks.some((block) => block.kind === kind);
  if (has('decision')) return 'decision';
  if (has('quick-check')) return 'quick-check';

  switch (content.type) {
    case 'true-false':
      // A binary item with a real answer side is a one-question choice; only
      // the authored quick-check block makes it a run of statements.
      return has('quick-check') ? 'quick-check' : 'multiple-choice';
    case 'multiple-choice':
      return 'multiple-choice';
    case 'code-reading':
    case 'explain-code':
      return 'code-reading';
    case 'find-the-bug':
    case 'debugging':
    case 'refactoring':
      return 'find-the-bug';
    case 'architecture':
    case 'system-design':
      return 'architecture';
    case 'concept':
      return content.requiresSpokenAttempt ? 'interview' : 'learn';
    case 'compare':
      // Comparisons are analysis. They read and write well, and forcing a
      // take in front of every one of them is how the product got noisy.
      return 'written';
    case 'security':
      return content.requiresSpokenAttempt ? 'interview' : 'written';
    default:
      break;
  }

  if (has('choices')) return 'multiple-choice';
  if (content.categoryId === 'english') return 'speaking';
  return content.requiresSpokenAttempt ? 'interview' : 'written';
}

export function responseModeOf(content: Content): ResponseMode {
  return content.responseMode ?? activityKindDef(activityKindOf(content)).responseMode;
}

export function activityLevelOf(content: Content): ActivityLevel {
  return activityKindDef(activityKindOf(content)).level;
}

/** True when this item belongs in Speaking Practice. */
export function isSpokenActivity(content: Content): boolean {
  return responseModeOf(content) === 'speak';
}

/**
 * Writing is always allowed where speaking is: a quiet office, a broken
 * microphone or plain preference should not end the session. The reverse is
 * not true — a microphone is never offered for a yes/no.
 */
export function allowsWriting(content: Content): boolean {
  const mode = responseModeOf(content);
  return mode === 'write' || mode === 'speak';
}

export function allowsRecording(content: Content): boolean {
  return responseModeOf(content) === 'speak';
}
