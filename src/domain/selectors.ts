import type {
  Attempt,
  Content,
  ContentProgress,
  Locale,
  SkillLevel,
  SrsState,
} from './types';
import { isDue, stateWeight } from './srs';

/**
 * Derived views over content plus progress.
 *
 * Everything here is a pure function of the data the app already holds, so
 * screens never compute study state themselves and two screens can never
 * disagree about what "needs review" means.
 */

export interface StudyIndex {
  content: Content[];
  byId: Map<string, Content>;
  progress: Record<string, ContentProgress>;
  attempts: Attempt[];
  favorites: Set<string>;
}

export function buildIndex(
  content: Content[],
  progress: Record<string, ContentProgress>,
  attempts: Attempt[],
  favorites: string[],
): StudyIndex {
  return {
    content,
    byId: new Map(content.map((item) => [item.id, item])),
    progress,
    attempts,
    favorites: new Set(favorites),
  };
}

export function stateOf(index: StudyIndex, contentId: string): SrsState {
  return index.progress[contentId]?.srsState ?? 'new';
}

/**
 * Skill levels.
 *
 * The level is the average mastery weight across the content that touches that
 * skill, not a count of items opened. Opening something you cannot answer moves
 * nothing, which is the entire point of the product.
 */
export function computeSkillLevels(index: StudyIndex): SkillLevel[] {
  const buckets = new Map<
    string,
    { weight: number; total: number; seen: number; mastered: number; due: number; last: string | null }
  >();

  for (const item of index.content) {
    for (const skillId of item.skillIds) {
      const bucket = buckets.get(skillId) ?? {
        weight: 0,
        total: 0,
        seen: 0,
        mastered: 0,
        due: 0,
        last: null,
      };

      const progress = index.progress[item.id];
      const state = progress?.srsState ?? 'new';

      bucket.total += 1;
      bucket.weight += stateWeight(state);
      if (state !== 'new') bucket.seen += 1;
      if (state === 'mastered') bucket.mastered += 1;
      if (isDue(progress)) bucket.due += 1;
      if (progress?.lastSeenAt && (!bucket.last || progress.lastSeenAt > bucket.last)) {
        bucket.last = progress.lastSeenAt;
      }

      buckets.set(skillId, bucket);
    }
  }

  return [...buckets.entries()].map(([skillId, bucket]) => ({
    skillId,
    level: bucket.total === 0 ? 0 : bucket.weight / bucket.total,
    contentSeen: bucket.seen,
    contentMastered: bucket.mastered,
    dueCount: bucket.due,
    lastPracticedAt: bucket.last,
  }));
}

/**
 * The skills to work on next.
 *
 * A skill the user has never touched is not "weak", it is unknown — ranking
 * those as weaknesses would tell a beginner their weakest area is whatever
 * they happened not to click. Only skills with real evidence are ranked.
 */
export function weakestSkills(levels: SkillLevel[], limit = 3): SkillLevel[] {
  return levels
    .filter((level) => level.contentSeen >= 2)
    .sort((a, b) => a.level - b.level)
    .slice(0, limit);
}

export function strongestSkills(levels: SkillLevel[], limit = 3): SkillLevel[] {
  return levels
    .filter((level) => level.contentSeen >= 2)
    .sort((a, b) => b.level - a.level)
    .slice(0, limit);
}

export function dueContent(index: StudyIndex, now = new Date()): Content[] {
  return index.content
    .filter((item) => isDue(index.progress[item.id], now))
    .sort((a, b) => {
      const aDue = index.progress[a.id]?.dueAt ?? '';
      const bDue = index.progress[b.id]?.dueAt ?? '';
      return aDue.localeCompare(bDue);
    });
}

/** The single item the user was last working on and has not finished. */
export function continueWhereYouLeftOff(index: StudyIndex): Content | null {
  const started = index.content
    .map((item) => ({ item, progress: index.progress[item.id] }))
    .filter(
      (entry) =>
        entry.progress?.lastSeenAt &&
        entry.progress.srsState !== 'mastered',
    )
    .sort((a, b) =>
      (b.progress?.lastSeenAt ?? '').localeCompare(a.progress?.lastSeenAt ?? ''),
    );

  return started[0]?.item ?? null;
}

export interface Recommendation {
  content: Content;
  /** Why this item is being suggested, so the UI never says "recommended". */
  reason: 'due' | 'weak-skill' | 'unfinished' | 'fresh-start' | 'language';
}

/**
 * What to do next.
 *
 * Ordering is deliberate: what has lapsed comes before what is new, because
 * forgetting something you could once explain is the more expensive failure.
 */
export function recommendNext(
  index: StudyIndex,
  options: { limit?: number; interviewLocale?: Locale } = {},
): Recommendation[] {
  const limit = options.limit ?? 6;
  const picked = new Set<string>();
  const out: Recommendation[] = [];

  const push = (content: Content, reason: Recommendation['reason']) => {
    if (picked.has(content.id) || out.length >= limit) return;
    picked.add(content.id);
    out.push({ content, reason });
  };

  for (const item of dueContent(index)) push(item, 'due');

  const weak = weakestSkills(computeSkillLevels(index), 3).map((level) => level.skillId);
  for (const skillId of weak) {
    const candidates = index.content.filter(
      (item) => item.skillIds.includes(skillId) && stateOf(index, item.id) !== 'mastered',
    );
    for (const candidate of candidates.slice(0, 2)) push(candidate, 'weak-skill');
  }

  if (options.interviewLocale === 'en') {
    const english = index.content.filter(
      (item) => item.categoryId === 'english' && stateOf(index, item.id) === 'new',
    );
    for (const item of english.slice(0, 2)) push(item, 'language');
  }

  const learning = index.content.filter((item) => stateOf(index, item.id) === 'learning');
  for (const item of learning) push(item, 'unfinished');

  // A first session needs somewhere obvious to start. Spoken formats come
  // first: the product is about answering out loud, so opening someone's very
  // first session with a multiple-choice item misrepresents what this is.
  const fresh = index.content
    .filter((item) => stateOf(index, item.id) === 'new')
    .sort((a, b) => {
      if (a.requiresSpokenAttempt !== b.requiresSpokenAttempt) {
        return a.requiresSpokenAttempt ? -1 : 1;
      }
      // A trap or a code listing is a poor very first question: the first
      // session should teach the loop, not ambush the person learning it.
      const friction = (item: Content) =>
        (item.isTrap ? 2 : 0) +
        (item.blocks.some((block) => block.phase === 'prompt' && block.kind === 'code') ? 1 : 0);
      const byFriction = friction(a) - friction(b);
      if (byFriction !== 0) return byFriction;
      return a.estimatedMinutes - b.estimatedMinutes;
    });
  for (const item of fresh) push(item, 'fresh-start');

  return out;
}

export interface StudyTotals {
  total: number;
  seen: number;
  mastered: number;
  due: number;
  spokenMs: number;
  attempts: number;
  spokenAttempts: number;
}

export function computeTotals(index: StudyIndex): StudyTotals {
  let seen = 0;
  let mastered = 0;
  let due = 0;
  let spokenMs = 0;

  for (const item of index.content) {
    const progress = index.progress[item.id];
    if (!progress || progress.srsState === 'new') continue;
    seen += 1;
    if (progress.srsState === 'mastered') mastered += 1;
    if (isDue(progress)) due += 1;
    spokenMs += progress.spokenMs;
  }

  return {
    total: index.content.length,
    seen,
    mastered,
    due,
    spokenMs,
    attempts: index.attempts.length,
    spokenAttempts: index.attempts.filter((attempt) => attempt.mode === 'spoken').length,
  };
}

/** Consecutive days with at least one attempt, counting back from today. */
export function computeStreak(attempts: Attempt[], now = new Date()): number {
  if (attempts.length === 0) return 0;

  // Local calendar days: at 22:00 in São Paulo the UTC date is already
  // tomorrow, which silently broke streaks for evening study.
  const days = new Set(attempts.map((attempt) => toDayKey(new Date(attempt.createdAt))));
  const cursor = new Date(now);
  let streak = 0;

  // Today not being practised yet does not break a streak until midnight.
  if (!days.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toDayKey(cursor))) return 0;
  }

  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function attemptsFor(index: StudyIndex, contentId: string): Attempt[] {
  return index.attempts
    .filter((attempt) => attempt.contentId === contentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/**
 * Search and filtering for the library.
 *
 * Text matching runs over the authored title and tags in every language the
 * item carries, so searching "event loop" finds the Portuguese item too.
 */
export interface LibraryFilters {
  text: string;
  categoryIds: string[];
  stackIds: string[];
  difficulties: string[];
  types: string[];
  states: SrsState[];
  locales: Locale[];
  favoritesOnly: boolean;
  trapsOnly: boolean;
}

export const EMPTY_FILTERS: LibraryFilters = {
  text: '',
  categoryIds: [],
  stackIds: [],
  difficulties: [],
  types: [],
  states: [],
  locales: [],
  favoritesOnly: false,
  trapsOnly: false,
};

export function filterContent(index: StudyIndex, filters: LibraryFilters): Content[] {
  const needle = filters.text.trim().toLowerCase();

  return index.content.filter((item) => {
    if (filters.favoritesOnly && !index.favorites.has(item.id)) return false;
    if (filters.trapsOnly && !item.isTrap) return false;
    if (filters.categoryIds.length && !filters.categoryIds.includes(item.categoryId)) return false;
    if (filters.difficulties.length && !filters.difficulties.includes(item.difficulty)) return false;
    if (filters.types.length && !filters.types.includes(item.type)) return false;

    if (filters.stackIds.length && !item.stackIds.some((id) => filters.stackIds.includes(id))) {
      return false;
    }

    if (filters.locales.length && !item.languages.some((code) => filters.locales.includes(code))) {
      return false;
    }

    if (filters.states.length && !filters.states.includes(stateOf(index, item.id))) return false;

    if (needle) {
      const haystack = [
        item.title.pt ?? '',
        item.title.en ?? '',
        ...item.tags,
        item.categoryId,
        ...item.stackIds,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: LibraryFilters): number {
  return (
    (filters.text.trim() ? 1 : 0) +
    filters.categoryIds.length +
    filters.stackIds.length +
    filters.difficulties.length +
    filters.types.length +
    filters.states.length +
    filters.locales.length +
    (filters.favoritesOnly ? 1 : 0) +
    (filters.trapsOnly ? 1 : 0)
  );
}
