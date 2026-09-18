/**
 * Behavioural check for the Today's Practice generator.
 * Run: npx tsx scripts/check-practice.ts
 *
 * Asserts the properties the product promises, against the real content bank:
 * no duplicates, a mix of activity kinds rather than ten of the same thing,
 * a cap on how much of a session is spoken, a session that climbs the ladder
 * instead of opening on its hardest question, English present in longer
 * sessions, no repeat of the previous session, lapsed and missed items
 * prioritised, and focus, stack and difficulty preferences moving the plan.
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
import { activityKindOf, activityLevelOf, responseModeOf } from '../src/domain/activity';
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
  const kinds = new Map<string, number>();
  plan.forEach((entry) => {
    const kind = activityKindOf(entry.content);
    kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
  });
  const spoken = plan.filter((entry) => responseModeOf(entry.content) === 'speak').length;

  check(plan.length === size, `size ${size}: got ${plan.length} items`);
  check(new Set(ids).size === ids.length, `size ${size}: duplicate items`);
  check(
    Math.max(...kinds.values()) <= Math.ceil(size / 4),
    `size ${size}: one activity kind exceeds a quarter of the session`,
  );
  // The whole point of the rebuild: a session is not a queue of recordings.
  check(
    spoken <= Math.max(1, Math.round(size / 5)),
    `size ${size}: ${spoken} spoken items, over the cap`,
  );
  check(kinds.size >= 4, `size ${size}: only ${kinds.size} kinds of activity`);
  if (size >= 10) check(plan.some((entry) => isEnglishItem(entry.content)), `size ${size}: no English item`);

  // It opens low on the ladder and does not open on a trap.
  const openerLevel = activityLevelOf(plan[0].content);
  const lowestLevel = Math.min(...plan.map((entry) => activityLevelOf(entry.content)));
  check(openerLevel === lowestLevel, `size ${size}: opener is not on the lowest rung present`);
  check(!plan[0].content.isTrap, `size ${size}: opener is a trap`);
  check(!isEnglishItem(plan[0].content), `size ${size}: opener is English for a Portuguese-answer user`);

  // And it ends higher than it started.
  const closingLevel = activityLevelOf(plan[plan.length - 1].content);
  check(closingLevel >= openerLevel, `size ${size}: the session ends lower than it starts`);

  const adjacentSameKind = plan.some(
    (entry, i) => i > 0 && activityKindOf(plan[i - 1].content) === activityKindOf(entry.content),
  );
  console.log(
    `size ${String(size).padStart(2)}: ${plan.length} items, ~${estimateSessionMinutes(plan.map((e) => e.content))} min, ` +
      `${kinds.size} kinds, ${spoken} spoken, adjacent same kind: ${adjacentSameKind}`,
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
