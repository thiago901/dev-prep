/**
 * Content integrity check. Run: npx tsx scripts/check-content.ts
 *
 * Fails on dangling related ids, missing languages, and items whose shape does
 * not match the work they claim to ask for — the mistakes an author makes that
 * the UI would quietly hide.
 */
import { SEED_CONTENT, SEED_CONTENT_BY_ID } from '../src/data/seed/contentBank';
import { LEARNING_PATHS } from '../src/data/seed/paths';
import { activityKindOf, activityLevelOf, responseModeOf } from '../src/domain/activity';
import type { ActivityKind, Locale } from '../src/domain/types';

const problems: string[] = [];
const counts: Record<string, number> = {};
const kinds: Record<string, number> = {};

for (const item of SEED_CONTENT) {
  counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  const kind = activityKindOf(item);
  kinds[kind] = (kinds[kind] ?? 0) + 1;
  const mode = responseModeOf(item);

  for (const id of item.relatedContentIds) {
    if (!SEED_CONTENT_BY_ID.has(id)) problems.push(`${item.id}: related "${id}" does not exist`);
  }

  // Each kind has its own idea of a complete item.
  const has = (blockKind: string) => item.blocks.some((block) => block.kind === blockKind);
  if (kind === 'learn') {
    if (item.blocks.length < 3) problems.push(`${item.id}: learn card is too thin`);
    if (mode !== 'read') problems.push(`${item.id}: learn card should be read-only`);
  } else if (kind === 'decision') {
    if (!has('decision')) problems.push(`${item.id}: decision has no decision block`);
  } else {
    if (!has('prompt')) problems.push(`${item.id}: no prompt block`);
    if (!item.blocks.some((block) => block.phase === 'answer')) {
      problems.push(`${item.id}: no answer-side blocks`);
    }
  }

  // A microphone is only ever offered where the work is a spoken answer.
  if (mode === 'speak' && !item.requiresSpokenAttempt) {
    problems.push(`${item.id}: spoken activity not marked as requiring a take`);
  }

  for (const block of item.blocks) {
    if (block.kind === 'decision') {
      if (block.cards.length < 2) problems.push(`${item.id}: a decision deck needs two cards`);
      for (const card of block.cards) {
        for (const locale of item.languages) {
          if (!card.statement[locale] || !card.verdict[locale] || !card.why[locale]) {
            problems.push(`${item.id}: decision card incomplete in ${locale}`);
          }
        }
      }
    }

    if (block.kind === 'choices' && block.options.some((option) => option.quality)) {
      // Where an author graded the options at all, the set has to carry the
      // shape the product promises: something ideal, and something that a
      // competent developer would really say and that still misses.
      const qualities = block.options.map(
        (option) => option.quality ?? (option.correct ? 'ideal' : 'incorrect'),
      );
      if (!qualities.includes('partial')) {
        problems.push(`${item.id}: multiple choice has no partially-correct option`);
      }
      if (!qualities.includes('ideal')) {
        problems.push(`${item.id}: multiple choice has no ideal option`);
      }
    }
  }

  for (const locale of item.languages as Locale[]) {
    if (!item.title[locale]) problems.push(`${item.id}: title missing ${locale}`);
    // Titles render as plain text in lists, search and tabs; markup would show raw.
    if (/[`*]/.test(item.title[locale] ?? '')) problems.push(`${item.id}: title contains markup (${locale})`);
    for (const block of item.blocks) {
      if (block.kind === 'answer-levels') {
        for (const level of block.levels) {
          if (!level.body[locale]) problems.push(`${item.id}: ${level.id} answer missing ${locale}`);
        }
      }
    }
  }
}

// --- learning paths --------------------------------------------------------
for (const path of LEARNING_PATHS) {
  if (path.stepIds.length < 3) problems.push(`${path.id}: a path needs at least three steps`);

  let previousLevel = 0;
  let regressions = 0;
  for (const stepId of path.stepIds) {
    const step = SEED_CONTENT_BY_ID.get(stepId);
    if (!step) {
      problems.push(`${path.id}: step "${stepId}" does not exist`);
      continue;
    }
    const level = activityLevelOf(step);
    if (level < previousLevel) regressions += 1;
    previousLevel = level;
  }
  // A path may plateau, but it should not walk back down the ladder twice.
  if (regressions > 1) problems.push(`${path.id}: steps go backwards down the ladder`);

  const first = SEED_CONTENT_BY_ID.get(path.stepIds[0] ?? '');
  if (first && activityKindOf(first) !== 'learn') {
    problems.push(`${path.id}: a path opens with a learn card`);
  }
  const last = SEED_CONTENT_BY_ID.get(path.stepIds[path.stepIds.length - 1] ?? '');
  if (last && responseModeOf(last) !== 'speak') {
    problems.push(`${path.id}: a path ends on a spoken answer`);
  }
}

const spoken = SEED_CONTENT.filter((item) => responseModeOf(item) === 'speak').length;
const share = Math.round((spoken / SEED_CONTENT.length) * 100);

console.log(`items: ${SEED_CONTENT.length}`);
console.log('by category:', counts);
console.log('by activity kind:', kinds as Record<ActivityKind, number>);
console.log(`spoken: ${spoken}/${SEED_CONTENT.length} (${share}%)`);
console.log(`paths: ${LEARNING_PATHS.length}`);
console.log(`traps: ${SEED_CONTENT.filter((c) => c.isTrap).length}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('\nno problems');
