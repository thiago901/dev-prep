/**
 * Behavioural check for the Today's Practice generator.
 * Run: npx tsx scripts/check-practice.ts
 *
 * Asserts the properties the product promises, against the real content bank:
 * no duplicates, variety caps, English present in longer sessions, no repeat
 * of the previous session, lapsed and missed items prioritised, and focus,
 * stack and difficulty preferences actually moving the plan.
 */
import { SEED_CONTENT } from '../src/data/seed/contentBank';
import { buildIndex } from '../src/domain/selectors';
import { createProgress, gradeProgress } from '../src/domain/srs';
import {
  DEFAULT_PRACTICE_PREFERENCES,
  createSessionFromPlan,
  estimateSessionMinutes,
  generatePracticeSession,
  isEnglishItem,
  matchesFocus,
  type PracticeSize,
} from '../src/domain/practice';
import type { ContentProgress } from '../src/domain/types';

const failures: string[] = [];
const check = (condition: boolean, message: string) => {
  if (!condition) failures.push(message);
};

const emptyIndex = buildIndex(SEED_CONTENT, {}, [], []);
const base = {
  preferences: DEFAULT_PRACTICE_PREFERENCES,
  recentSessions: [],
  answerLocale: 'pt' as const,
  seed: 'fixed',
};

for (const size of [5, 10, 20] as PracticeSize[]) {
  const plan = generatePracticeSession(emptyIndex, { ...base, size });
  const ids = plan.map((entry) => entry.content.id);
  const types = new Map<string, number>();
  plan.forEach((entry) => types.set(entry.content.type, (types.get(entry.content.type) ?? 0) + 1));

  check(plan.length === size, `size ${size}: got ${plan.length} items`);
  check(new Set(ids).size === ids.length, `size ${size}: duplicate items`);
  check(Math.max(...types.values()) <= Math.ceil(size / 4), `size ${size}: one type exceeds a quarter`);
  if (size >= 10) check(plan.some((entry) => isEnglishItem(entry.content)), `size ${size}: no English item`);
  check(plan[0].content.requiresSpokenAttempt && !plan[0].content.isTrap, `size ${size}: opener is not a calm spoken item`);
  check(!isEnglishItem(plan[0].content), `size ${size}: opener is English for a Portuguese-answer user`);

  const adjacentSameType = plan.some((entry, i) => i > 0 && plan[i - 1].content.type === entry.content.type);
  console.log(
    `size ${String(size).padStart(2)}: ${plan.length} items, ~${estimateSessionMinutes(plan.map((e) => e.content))} min, ` +
      `${types.size} types, adjacent same type: ${adjacentSameType}`,
  );
}

// Consecutive sessions must not repeat.
const first = createSessionFromPlan(generatePracticeSession(emptyIndex, { ...base, size: 10 }), 10, 's1');
const second = generatePracticeSession(emptyIndex, { ...base, size: 10, seed: 'other', recentSessions: [first] });
const overlap = second.filter((entry) => first.items.some((item) => item.contentId === entry.content.id));
check(overlap.length === 0, `consecutive sessions share ${overlap.length} items`);

// Lapsed and missed items must be chosen, with the right reason.
const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
const progress: Record<string, ContentProgress> = {};
const dueId = 'db-index-basics';
const missedId = 'sec-idor';
progress[dueId] = gradeProgress(createProgress(dueId), { confidence: 'known', attempted: true, now: past });
progress[missedId] = gradeProgress(createProgress(missedId), { confidence: 'unknown', attempted: true, now: past });
const withHistory = buildIndex(SEED_CONTENT, progress, [], []);
const reviewPlan = generatePracticeSession(withHistory, { ...base, size: 10 });
const due = reviewPlan.find((entry) => entry.content.id === dueId);
const missed = reviewPlan.find((entry) => entry.content.id === missedId);
check(Boolean(due), 'a due review was not included');
check(due?.reason === 'review', `due item reason was ${due?.reason}`);
check(Boolean(missed), 'a missed item was not included');

// Focus must dominate when set.
const focused = generatePracticeSession(emptyIndex, {
  ...base,
  size: 10,
  preferences: { ...DEFAULT_PRACTICE_PREFERENCES, focus: ['security'] },
});
const securityCount = focused.filter((entry) => matchesFocus(entry.content, 'security')).length;
check(securityCount >= 3, `security focus produced only ${securityCount} security items`);

// "Comfortable" must avoid expert items.
const comfortable = generatePracticeSession(emptyIndex, {
  ...base,
  size: 10,
  preferences: { ...DEFAULT_PRACTICE_PREFERENCES, difficulty: 'comfortable' },
});
const experts = comfortable.filter((entry) => entry.content.difficulty === 'expert').length;
check(experts === 0, `comfortable difficulty included ${experts} expert items`);

console.log(`security focus: ${securityCount}/10 · comfortable experts: ${experts} · consecutive overlap: ${overlap.length}`);

if (failures.length) {
  console.log(`\n${failures.length} failure(s):\n` + failures.join('\n'));
  process.exit(1);
}
console.log('\nall practice checks passed');
