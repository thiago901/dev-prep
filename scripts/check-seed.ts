/**
 * Seed shape check. Run: npm run check:seed
 *
 * Everything the Firestore seed would write, verified without credentials:
 * stable unique ids, no `undefined` (Firestore rejects it), no value Firestore
 * cannot store, and document sizes inside the 1 MiB limit. This is what keeps
 * `npm run seed:all` from failing halfway through against a real project.
 */
import { SEED_CONTENT } from '../src/data/seed/contentBank';
import { LEARNING_PATHS } from '../src/data/seed/paths';
import { SOURCES } from '../src/data/seed/sources';
import {
  CATEGORIES,
  CONTENT_TYPES,
  DIFFICULTIES,
  MOCK_BLUEPRINTS,
  SKILLS,
  STACKS,
} from '../src/data/seed/taxonomy';

const problems: string[] = [];
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/** Firestore document ids: no slashes, no dots, never empty, under 1500 bytes. */
function checkId(collection: string, id: string) {
  if (!id) problems.push(`${collection}: empty document id`);
  else if (!ID_PATTERN.test(id)) problems.push(`${collection}/${id}: id is not a stable slug`);
  if (id.includes('/')) problems.push(`${collection}/${id}: id contains a slash`);
}

function walk(collection: string, id: string, value: unknown, path: string, depth = 0) {
  if (depth > 20) {
    problems.push(`${collection}/${id}: nesting deeper than Firestore allows at ${path}`);
    return;
  }
  if (value === undefined) {
    problems.push(`${collection}/${id}: undefined at ${path} — Firestore rejects it`);
    return;
  }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) problems.push(`${collection}/${id}: non-finite number at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(collection, id, entry, `${path}[${index}]`, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (key.includes('.')) problems.push(`${collection}/${id}: field name with a dot at ${path}.${key}`);
      walk(collection, id, entry, `${path}.${key}`, depth + 1);
    }
    return;
  }
  problems.push(`${collection}/${id}: ${typeof value} at ${path} cannot be stored`);
}

function checkCollection(collection: string, documents: Array<{ id: string }>) {
  const seen = new Set<string>();
  let largest = 0;

  for (const document of documents) {
    checkId(collection, document.id);
    if (seen.has(document.id)) problems.push(`${collection}/${document.id}: duplicate id`);
    seen.add(document.id);
    walk(collection, document.id, document, '');

    const bytes = Buffer.byteLength(JSON.stringify(document), 'utf8');
    largest = Math.max(largest, bytes);
    // Firestore's hard limit is 1 MiB per document; anything close to it is a
    // sign the item should be split before it becomes unwritable.
    if (bytes > 900_000) problems.push(`${collection}/${document.id}: ${bytes} bytes, near the 1 MiB limit`);
  }

  console.log(
    `${collection.padEnd(22)} ${String(documents.length).padStart(4)} docs · largest ${(largest / 1024).toFixed(1)} kB`,
  );
}

checkCollection('content', SEED_CONTENT);
checkCollection('learningPaths', LEARNING_PATHS);
checkCollection('sources', SOURCES);
checkCollection('taxonomy/categories', CATEGORIES);
checkCollection('taxonomy/stacks', STACKS);
checkCollection('taxonomy/difficulties', DIFFICULTIES);
checkCollection('taxonomy/contentTypes', CONTENT_TYPES);
checkCollection('taxonomy/skills', SKILLS);
checkCollection('taxonomy/mockBlueprints', MOCK_BLUEPRINTS);

// Cross-collection references have to resolve, or the app renders a dead link
// against data that is already in production.
const contentIds = new Set(SEED_CONTENT.map((item) => item.id));
const sourceIds = new Set(SOURCES.map((source) => source.id));
const categoryIds = new Set(CATEGORIES.map((category) => category.id));
const stackIds = new Set(STACKS.map((stack) => stack.id));
const skillIds = new Set(SKILLS.map((skill) => skill.id));

for (const item of SEED_CONTENT) {
  if (!categoryIds.has(item.categoryId)) problems.push(`${item.id}: unknown category ${item.categoryId}`);
  for (const stack of item.stackIds) {
    if (!stackIds.has(stack)) problems.push(`${item.id}: unknown stack ${stack}`);
  }
  for (const skill of item.skillIds) {
    if (!skillIds.has(skill)) problems.push(`${item.id}: unknown skill ${skill}`);
  }
  for (const source of item.sourceIds ?? []) {
    if (!sourceIds.has(source)) problems.push(`${item.id}: unknown source ${source}`);
  }
}

for (const path of LEARNING_PATHS) {
  if (!categoryIds.has(path.categoryId)) problems.push(`${path.id}: unknown category ${path.categoryId}`);
  for (const step of path.stepIds) {
    if (!contentIds.has(step)) problems.push(`${path.id}: step ${step} does not exist`);
  }
}

for (const source of SOURCES) {
  if (!/^https:\/\//.test(source.url)) problems.push(`${source.id}: source url is not https`);
}

if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('\nseed documents are writable as-is');
