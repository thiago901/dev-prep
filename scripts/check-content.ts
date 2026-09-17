/**
 * Content integrity check. Run: npx tsx scripts/check-content.ts
 * Fails on dangling related ids, missing languages, and answerable items with
 * no answer side — the mistakes an author makes that the UI would hide.
 */
import { SEED_CONTENT, SEED_CONTENT_BY_ID } from '../src/data/seed/contentBank';

const problems: string[] = [];
const counts: Record<string, number> = {};

for (const item of SEED_CONTENT) {
  counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;

  for (const id of item.relatedContentIds) {
    if (!SEED_CONTENT_BY_ID.has(id)) problems.push(`${item.id}: related "${id}" does not exist`);
  }

  if (!item.blocks.some((b) => b.kind === 'prompt')) problems.push(`${item.id}: no prompt block`);
  if (!item.blocks.some((b) => b.phase === 'answer')) problems.push(`${item.id}: no answer-side blocks`);

  for (const locale of item.languages) {
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

console.log(`items: ${SEED_CONTENT.length}`);
console.log('by category:', counts);
console.log(`traps: ${SEED_CONTENT.filter((c) => c.isTrap).length}`);
console.log(`types: ${[...new Set(SEED_CONTENT.map((c) => c.type))].join(', ')}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('\nno problems');
