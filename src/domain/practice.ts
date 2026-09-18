import type {
  AttemptMode,
  Confidence,
  Content,
  ContentTypeId,
  DifficultyId,
  Locale,
} from './types';
import type { StudyIndex } from './selectors';
import { computeSkillLevels, stateOf } from './selectors';
import { daysUntilDue, isDue } from './srs';
import { activityKindOf, activityLevelOf, responseModeOf } from './activity';

/**
 * Today's Practice.
 *
 * A short, finite session built to answer one question: "what should I
 * practise right now to get better at interviews?" — not "what content can we
 * show?". The generator scores every item against real evidence (lapsed
 * reviews, missed answers, weak skills, the user's focus and stacks) and then
 * enforces variety, so a session is never ten items of the same kind.
 *
 * Nothing here is random in the product sense. The only randomness is a small
 * seeded jitter that stops two equally good sessions from being identical,
 * and it is seeded per day so the plan on the Home screen is the plan you get.
 */

export type PracticeSize = 5 | 10 | 20;

export const PRACTICE_SIZES: readonly PracticeSize[] = [5, 10, 20] as const;

export type PracticeFocus =
  | 'technical'
  | 'english'
  | 'behavioral'
  | 'architecture'
  | 'security'
  | 'code-reading';

export const PRACTICE_FOCUSES: readonly PracticeFocus[] = [
  'technical',
  'english',
  'behavioral',
  'architecture',
  'security',
  'code-reading',
] as const;

export type PracticeDifficulty = 'mixed' | 'comfortable' | 'challenging' | 'hard';

export interface PracticePreferences {
  dailyGoal: PracticeSize;
  /** Empty means no emphasis: the generator balances on its own. */
  focus: PracticeFocus[];
  difficulty: PracticeDifficulty;
  stackIds: string[];
}

export const DEFAULT_PRACTICE_PREFERENCES: PracticePreferences = {
  dailyGoal: 10,
  focus: [],
  difficulty: 'mixed',
  stackIds: [],
};

/** Why an item was chosen. Every item carries exactly one, the strongest. */
export type PracticeReason = 'review' | 'missed' | 'weak-skill' | 'focus' | 'new' | 'english';

export type PracticeItemStatus = 'pending' | 'done' | 'skipped';

/**
 * What the user reported, including "too easy" — which only exists in
 * practice, because it is the signal that lets the next session push harder.
 */
export type PracticeConfidence = Confidence;

export interface PracticeItem {
  contentId: string;
  reason: PracticeReason;
  status: PracticeItemStatus;
  startedAt: string | null;
  finishedAt: string | null;
  attemptId: string | null;
  mode: AttemptMode | null;
  durationMs: number;
  confidence: PracticeConfidence | null;
}

export interface PracticeSession {
  id: string;
  /** Local calendar day, YYYY-MM-DD. */
  day: string;
  size: PracticeSize;
  createdAt: string;
  completedAt: string | null;
  /** Explicitly ended before the last item; progress stays saved. */
  endedEarly: boolean;
  position: number;
  items: PracticeItem[];
}

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

/**
 * Minutes a practice activity takes. Deliberately not the content's
 * estimatedMinutes, which is the time to study an item properly; a practice
 * rep is one attempt, one reveal, one confidence answer.
 */
export function practiceMinutes(content: Content): number {
  // One rep: roughly a minute of answering plus reading the short answer and
  // grading. The full answer levels are there, but a rep does not read them all.
  if (!content.requiresSpokenAttempt) return 0.5;
  if (content.type === 'system-design' || content.type === 'architecture') return 1.5;
  return 1;
}

export function estimateSessionMinutes(contents: Content[]): number {
  return Math.max(1, Math.round(contents.reduce((sum, item) => sum + practiceMinutes(item), 0)));
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const TECHNICAL_CATEGORIES = new Set([
  'javascript',
  'backend',
  'database',
  'performance',
  'devops',
  'frontend',
]);

const CODE_READING_TYPES = new Set<ContentTypeId>([
  'code-reading',
  'explain-code',
  'find-the-bug',
  'refactoring',
]);

export function isEnglishItem(content: Content): boolean {
  return (
    content.categoryId === 'english' ||
    (content.languages.length === 1 && content.languages[0] === 'en')
  );
}

export function matchesFocus(content: Content, focus: PracticeFocus): boolean {
  switch (focus) {
    case 'technical':
      return TECHNICAL_CATEGORIES.has(content.categoryId);
    case 'english':
      return isEnglishItem(content);
    case 'behavioral':
      return content.categoryId === 'behavioral' || content.type === 'behavioral';
    case 'architecture':
      return content.categoryId === 'architecture' || content.categoryId === 'system-design';
    case 'security':
      return content.categoryId === 'security' || content.type === 'security';
    case 'code-reading':
      return CODE_READING_TYPES.has(content.type);
    default:
      return false;
  }
}

/** The kind a completed activity counts as in the session summary. */
export type PracticeKind =
  | 'speaking'
  | 'technical'
  | 'code-reading'
  | 'architecture'
  | 'security'
  | 'behavioral'
  | 'english'
  | 'review';

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32: small, fast, good enough for ordering ties. */
export function seededRandom(seed: string): () => number {
  let state = hashString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  size: PracticeSize;
  preferences: PracticePreferences;
  /** Most recent first. Used to avoid repeating yesterday's questions. */
  recentSessions: PracticeSession[];
  answerLocale: Locale;
  seed: string;
  now?: Date;
}

interface Scored {
  content: Content;
  score: number;
  reason: PracticeReason;
}

const DIFFICULTY_RANK: Record<DifficultyId, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  expert: 3,
};

function difficultyAdjustment(content: Content, preference: PracticeDifficulty): number {
  const rank = DIFFICULTY_RANK[content.difficulty];
  switch (preference) {
    case 'comfortable':
      return rank <= 1 ? 14 : rank === 3 ? -22 : -6;
    case 'challenging':
      return rank === 2 ? 14 : rank === 3 ? 6 : -8;
    case 'hard':
      return (rank >= 2 ? 16 : -14) + (content.isTrap ? 10 : 0);
    case 'mixed':
    default:
      return 0;
  }
}

function scoreContent(index: StudyIndex, options: GenerateOptions): Scored[] {
  const now = options.now ?? new Date();
  const { preferences } = options;

  const weakSkills = new Set(
    computeSkillLevels(index)
      .filter((level) => level.contentSeen > 0 && level.level < 0.4)
      .map((level) => level.skillId),
  );

  // Items in the last two sessions are held back so consecutive sessions do
  // not repeat — unless they genuinely lapsed, which is what review is for.
  const recentIds = new Set(
    options.recentSessions.slice(0, 2).flatMap((session) => session.items.map((item) => item.contentId)),
  );

  const dayMs = 24 * 60 * 60 * 1000;

  return index.content.map((content) => {
    const progress = index.progress[content.id];
    const state = stateOf(index, content.id);
    const parts: Array<[PracticeReason, number]> = [];
    let score = 0;

    if (isDue(progress, now)) {
      const overdue = Math.max(0, -(daysUntilDue(progress, now) ?? 0));
      parts.push(['review', 48 + Math.min(overdue, 10) * 2]);
    }

    if (progress?.lastConfidence === 'unknown') parts.push(['missed', 42]);
    else if (progress?.lastConfidence === 'partial') parts.push(['missed', 22]);

    if (content.skillIds.some((skillId) => weakSkills.has(skillId))) parts.push(['weak-skill', 24]);

    if (preferences.focus.some((focus) => matchesFocus(content, focus))) parts.push(['focus', 30]);

    if (state === 'new') parts.push(['new', 16]);

    const englishWanted =
      options.answerLocale === 'en' || preferences.focus.includes('english');
    if (isEnglishItem(content) && englishWanted) parts.push(['english', 12]);

    for (const [, value] of parts) score += value;

    if (preferences.stackIds.length > 0) {
      const hits = content.stackIds.some((stackId) => preferences.stackIds.includes(stackId));
      // Content with no stack (behavioural, architecture) stays neutral rather
      // than being punished for not naming a technology.
      if (hits) score += 14;
      else if (content.stackIds.length > 0) score -= 8;
    }

    score += difficultyAdjustment(content, preferences.difficulty);

    // "Too easy" and mastered items step back; they return through review.
    if (progress?.lastConfidence === 'easy') score -= 28;
    if (state === 'mastered' && !isDue(progress, now)) score -= 34;

    if (recentIds.has(content.id) && !isDue(progress, now)) score -= 60;

    if (progress?.lastSeenAt) {
      const sinceSeen = now.getTime() - new Date(progress.lastSeenAt).getTime();
      if (sinceSeen < dayMs && !isDue(progress, now)) score -= 26;
    }

    const reason =
      parts.length > 0
        ? parts.reduce((best, current) => (current[1] > best[1] ? current : best))[0]
        : 'new';

    return { content, score, reason };
  });
}

/**
 * Picks the session.
 *
 * Greedy over the scored list, with caps that guarantee variety: no content
 * type may take more than a quarter of the session and no category more than
 * a third. A session of ten therefore mixes at least four kinds of activity.
 */
export function generatePracticeSession(
  index: StudyIndex,
  options: GenerateOptions,
): Array<{ content: Content; reason: PracticeReason }> {
  const random = seededRandom(options.seed);
  const size = options.size;

  const scored = scoreContent(index, options)
    // Jitter breaks ties between equally good items without letting noise
    // outrank evidence: a due review (48+) always beats a new item (16).
    .map((entry) => ({ ...entry, score: entry.score + random() * 10 }))
    .sort((a, b) => b.score - a.score);

  const kindCap = Math.max(1, Math.ceil(size / 4));
  const categoryCap = Math.max(2, Math.ceil(size / 3));
  const reviewCap = Math.max(1, Math.ceil(size * 0.4));
  // Speaking is a tool, not the toll booth. A ten-item session holds two
  // spoken answers; the rest of the microphone work lives in its own area.
  const speakCap = Math.max(1, Math.round(size / 5));

  const picked: Scored[] = [];
  const kindCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  let reviewCount = 0;
  let speakCount = 0;

  const accept = (entry: Scored, relaxed: boolean): boolean => {
    if (picked.some((item) => item.content.id === entry.content.id)) return false;
    const kind = activityKindOf(entry.content);
    const kinds = kindCount.get(kind) ?? 0;
    const categories = categoryCount.get(entry.content.categoryId) ?? 0;
    const isReview = entry.reason === 'review' || entry.reason === 'missed';
    const speaks = responseModeOf(entry.content) === 'speak';

    if (!relaxed) {
      if (kinds >= kindCap || categories >= categoryCap) return false;
      if (isReview && reviewCount >= reviewCap) return false;
    }
    // The speaking cap holds even in the relaxed pass: a session that fills up
    // with recordings is the problem this whole model exists to fix.
    if (speaks && speakCount >= speakCap) return false;

    picked.push(entry);
    kindCount.set(kind, kinds + 1);
    categoryCount.set(entry.content.categoryId, categories + 1);
    if (isReview) reviewCount += 1;
    if (speaks) speakCount += 1;
    return true;
  };

  // Evidence first, always: what lapsed and what was missed gets its slots
  // before any shaping rule spends them.
  for (const entry of scored.filter((item) => item.reason === 'review' || item.reason === 'missed')) {
    if (picked.length >= size) break;
    accept(entry, false);
  }

  // Every session that has room opens the door to something new rather than
  // only rehearsing: one briefing, and one recognition or decision step.
  if (size >= 5) {
    const firstRung = scored.filter((item) => activityLevelOf(item.content) <= 2);
    for (const entry of firstRung.slice(0, size >= 10 ? 2 : 1)) accept(entry, false);
    const middleRung = scored.filter((item) => activityLevelOf(item.content) === 3);
    for (const entry of middleRung.slice(0, size >= 10 ? 2 : 1)) accept(entry, false);
  }

  // Sessions of ten or more always include some English speaking, because
  // spoken English is a first-class skill in this product, not an extra.
  if (size >= 10) {
    const englishSlots = size >= 20 ? 3 : 1;
    for (const entry of scored.filter((item) => isEnglishItem(item.content)).slice(0, englishSlots)) {
      accept(entry, false);
    }
  }

  for (const entry of scored) {
    if (picked.length >= size) break;
    accept(entry, false);
  }

  // A small content bank can make the caps unsatisfiable; fill the remainder
  // rather than returning a short session.
  for (const entry of scored) {
    if (picked.length >= size) break;
    accept(entry, true);
  }

  const englishFirst = options.answerLocale === 'en' || options.preferences.focus.includes('english');
  return orderForFlow(picked.slice(0, size), englishFirst).map(({ content, reason }) => ({ content, reason }));
}

/**
 * Orders a session so it has a beginning, a middle and an end.
 *
 * The session climbs the ladder: it opens on the lowest rung available — a
 * briefing or a quick check rather than "argue with your senior" — and works
 * upwards to the spoken answers, never putting two items of the same kind or
 * category back to back when it can avoid it.
 */
function orderForFlow(items: Scored[], englishFirst: boolean): Scored[] {
  const remaining = [...items];
  const ordered: Scored[] = [];

  // Lowest rung first. Within a rung the generator's own ranking survives.
  remaining.sort((a, b) => activityLevelOf(a.content) - activityLevelOf(b.content));

  // The first rep should be in the language the user chose to practise in;
  // English still appears later in the session, just not as the way in.
  const calm = (item: Scored) => !item.content.isTrap && item.content.difficulty !== 'expert';
  let openerIndex = remaining.findIndex(
    (item) => calm(item) && (englishFirst || !isEnglishItem(item.content)),
  );
  if (openerIndex < 0) openerIndex = remaining.findIndex(calm);
  if (openerIndex >= 0) ordered.push(...remaining.splice(openerIndex, 1));

  while (remaining.length > 0) {
    const last = ordered.at(-1);
    const nextIndex = remaining.findIndex(
      (item) =>
        !last ||
        (activityKindOf(item.content) !== activityKindOf(last.content) &&
          item.content.categoryId !== last.content.categoryId),
    );
    ordered.push(...remaining.splice(nextIndex >= 0 ? nextIndex : 0, 1));
  }

  return ordered;
}

export function createSessionFromPlan(
  plan: Array<{ content: Content; reason: PracticeReason }>,
  size: PracticeSize,
  id: string,
  now = new Date(),
): PracticeSession {
  return {
    id,
    day: localDayKey(now),
    size,
    createdAt: now.toISOString(),
    completedAt: null,
    endedEarly: false,
    position: 0,
    items: plan.map(({ content, reason }) => ({
      contentId: content.id,
      reason,
      status: 'pending',
      startedAt: null,
      finishedAt: null,
      attemptId: null,
      mode: null,
      durationMs: 0,
      confidence: null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Explanation and summary
// ---------------------------------------------------------------------------

export interface PlanExplanation {
  review: number;
  fresh: number;
  weak: number;
  technical: number;
  english: number;
  speaking: number;
}

/** "Why these activities?" — counted from the plan, never invented. */
export function explainPlan(plan: Array<{ content: Content; reason: PracticeReason }>): PlanExplanation {
  return {
    review: plan.filter((item) => item.reason === 'review' || item.reason === 'missed').length,
    fresh: plan.filter((item) => item.reason === 'new' || item.reason === 'focus').length,
    weak: plan.filter((item) => item.reason === 'weak-skill').length,
    technical: plan.filter((item) => TECHNICAL_CATEGORIES.has(item.content.categoryId)).length,
    english: plan.filter((item) => isEnglishItem(item.content)).length,
    // What the user will actually be asked to say out loud, which is not the
    // same as what the old flag called "spoken".
    speaking: plan.filter((item) => responseModeOf(item.content) === 'speak').length,
  };
}

export function sessionProgress(session: PracticeSession, byId: Map<string, Content>) {
  const finished = session.items.filter((item) => item.status !== 'pending');
  const pending = session.items
    .filter((item) => item.status === 'pending')
    .map((item) => byId.get(item.contentId))
    .filter((item): item is Content => Boolean(item));

  return {
    done: finished.length,
    total: session.items.length,
    remainingMinutes: pending.length > 0 ? estimateSessionMinutes(pending) : 0,
    // Finishing the last item is not finishing the session: the user still
    // reads that answer and presses Finish. Only an explicit end completes it.
    complete: session.completedAt !== null,
  };
}

export function kindsOf(content: Content, item: PracticeItem): PracticeKind[] {
  const kinds: PracticeKind[] = [];
  if (item.mode === 'spoken') kinds.push('speaking');
  if (item.reason === 'review' || item.reason === 'missed') kinds.push('review');
  if (CODE_READING_TYPES.has(content.type)) kinds.push('code-reading');
  else if (content.categoryId === 'security' || content.type === 'security') kinds.push('security');
  else if (content.categoryId === 'architecture' || content.categoryId === 'system-design') {
    kinds.push('architecture');
  } else if (content.categoryId === 'behavioral') kinds.push('behavioral');
  else if (isEnglishItem(content)) kinds.push('english');
  else if (TECHNICAL_CATEGORIES.has(content.categoryId)) kinds.push('technical');
  return kinds;
}

export interface SessionSummary {
  completed: number;
  skipped: number;
  total: number;
  minutes: number;
  categoryIds: string[];
  knew: number;
  needsReview: string[];
  recordings: number;
  kinds: Array<{ kind: PracticeKind; count: number }>;
}

export function summariseSession(session: PracticeSession, byId: Map<string, Content>): SessionSummary {
  const done = session.items.filter((item) => item.status === 'done');
  const counts = new Map<PracticeKind, number>();
  const categories = new Set<string>();

  let minutes = 0;
  for (const item of done) {
    const content = byId.get(item.contentId);
    if (!content) continue;
    categories.add(content.categoryId);
    for (const kind of kindsOf(content, item)) counts.set(kind, (counts.get(kind) ?? 0) + 1);

    // Measured time where a take exists; the activity estimate otherwise.
    if (item.startedAt && item.finishedAt) {
      const elapsed = new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime();
      minutes += Math.min(elapsed / 60000, practiceMinutes(content) * 4);
    } else {
      minutes += practiceMinutes(content);
    }
  }

  const order: PracticeKind[] = [
    'speaking',
    'technical',
    'code-reading',
    'architecture',
    'security',
    'behavioral',
    'english',
    'review',
  ];

  return {
    completed: done.length,
    skipped: session.items.filter((item) => item.status === 'skipped').length,
    total: session.items.length,
    minutes: Math.max(1, Math.round(minutes)),
    categoryIds: [...categories],
    knew: done.filter((item) => item.confidence === 'known' || item.confidence === 'easy').length,
    needsReview: done
      .filter((item) => item.confidence === 'unknown' || item.confidence === 'partial')
      .map((item) => item.contentId),
    recordings: done.filter((item) => item.mode === 'spoken').length,
    kinds: order
      .filter((kind) => counts.has(kind))
      .map((kind) => ({ kind, count: counts.get(kind) ?? 0 })),
  };
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export type Recommendation =
  | { kind: 'struggled'; contentId: string; relatedIds: string[] }
  | { kind: 'english-short'; contentId: string; percentOfUsual: number }
  | { kind: 'push-harder' };

/**
 * What to do next, but only where the data supports saying it.
 *
 * Each recommendation needs its own evidence threshold. With nothing that
 * meets one, the list is empty and the screen says so plainly — an invented
 * "great job, keep going" is exactly the artificial feedback this product
 * refuses to give.
 */
export function recommendAfterSession(
  session: PracticeSession,
  index: StudyIndex,
): Recommendation[] {
  const out: Recommendation[] = [];
  const done = session.items.filter((item) => item.status === 'done');

  const struggled = done.find((item) => item.confidence === 'unknown') ??
    done.find((item) => item.confidence === 'partial');
  if (struggled) {
    const content = index.byId.get(struggled.contentId);
    const relatedIds = (content?.relatedContentIds ?? [])
      .filter((id) => index.byId.has(id) && stateOf(index, id) !== 'mastered')
      .slice(0, 2);
    if (content && relatedIds.length > 0) {
      out.push({ kind: 'struggled', contentId: content.id, relatedIds });
    }
  }

  // "Shorter than usual" needs a usual: at least three earlier English takes.
  const englishTakes = done.filter((item) => {
    const content = index.byId.get(item.contentId);
    return content && isEnglishItem(content) && item.mode === 'spoken' && item.durationMs > 0;
  });
  const sessionAttemptIds = new Set(done.map((item) => item.attemptId).filter(Boolean));
  const history = index.attempts
    .filter((attempt) => {
      const content = index.byId.get(attempt.contentId);
      return (
        content &&
        isEnglishItem(content) &&
        attempt.mode === 'spoken' &&
        attempt.durationMs > 0 &&
        !sessionAttemptIds.has(attempt.id)
      );
    })
    .map((attempt) => attempt.durationMs)
    .sort((a, b) => a - b);

  if (englishTakes.length > 0 && history.length >= 3) {
    const median = history[Math.floor(history.length / 2)];
    const shortest = englishTakes.reduce((min, item) => (item.durationMs < min.durationMs ? item : min));
    const ratio = shortest.durationMs / median;
    if (ratio < 0.7) {
      out.push({
        kind: 'english-short',
        contentId: shortest.contentId,
        percentOfUsual: Math.round(ratio * 100),
      });
    }
  }

  const graded = done.filter((item) => item.confidence !== null);
  if (graded.length >= 5 && graded.every((item) => item.confidence === 'easy' || item.confidence === 'known')) {
    out.push({ kind: 'push-harder' });
  }

  return out;
}
