/**
 * Seeds the Firestore content catalogue.
 *
 * Idempotent by construction: every document is written at its own stable id,
 * so running this twice updates in place instead of duplicating. Nothing is
 * deleted unless `--prune` is passed, because an id that disappeared from the
 * seed is usually a rename in progress, not an intent to destroy.
 *
 *   npm run seed:all            everything
 *   npm run seed:content        just the content bank
 *   npm run seed:taxonomy       categories, stacks, difficulties, skills
 *   npm run seed:paths          learning paths
 *   npm run seed:sources        the documentation references
 *   npm run seed:all -- --dry-run     print what would change, write nothing
 *
 * Credentials: a service account with Firestore write access, pointed at by
 * GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_SERVICE_ACCOUNT), plus the
 * project id from .env. This never runs in the browser and never ships to it.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

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

type Collection = 'content' | 'taxonomy' | 'paths' | 'sources';

interface Options {
  only: Collection[];
  dryRun: boolean;
  prune: boolean;
}

const ALL: Collection[] = ['taxonomy', 'sources', 'content', 'paths'];

function parseArgs(argv: string[]): Options {
  const only = argv
    .filter((arg) => !arg.startsWith('--'))
    .filter((arg): arg is Collection => (ALL as string[]).includes(arg));
  return {
    only: only.length ? only : ALL,
    dryRun: argv.includes('--dry-run'),
    prune: argv.includes('--prune'),
  };
}

/** Reads `.env` without pulling a dependency in for six lines of parsing. */
function readEnvFile(): Record<string, string> {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function connect(): { app: App; db: Firestore; projectId: string } {
  const env = { ...readEnvFile(), ...process.env } as Record<string, string>;
  const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS ?? env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = env.FIREBASE_PROJECT_ID ?? env.VITE_FIREBASE_PROJECT_ID;

  if (!credentialsPath) {
    throw new Error(
      'No service account. Set GOOGLE_APPLICATION_CREDENTIALS (or FIREBASE_SERVICE_ACCOUNT) to the JSON key path.\n' +
        'Firebase console -> Project settings -> Service accounts -> Generate new private key.',
    );
  }
  const keyPath = resolve(process.cwd(), credentialsPath);
  if (!existsSync(keyPath)) throw new Error(`Service account file not found: ${keyPath}`);

  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8')) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };
  const resolvedProject = projectId ?? serviceAccount.project_id;
  if (!resolvedProject) throw new Error('No project id in .env or in the service account file.');

  const app =
    getApps()[0] ??
    initializeApp({ credential: cert(keyPath), projectId: resolvedProject });

  return { app, db: getFirestore(app), projectId: resolvedProject };
}

/** Firestore rejects `undefined`; the seed shape has optional fields. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

interface WriteReport {
  created: number;
  updated: number;
  unchanged: number;
  deleted: number;
}

async function upsert(
  db: Firestore,
  path: string,
  documents: Array<{ id: string; data: Record<string, unknown> }>,
  options: Options,
): Promise<WriteReport> {
  const report: WriteReport = { created: 0, updated: 0, unchanged: 0, deleted: 0 };
  const collection = db.collection(path);
  const existing = await collection.get();
  const existingById = new Map(existing.docs.map((doc) => [doc.id, doc.data()]));

  // Firestore caps a batch at 500 operations; the bank is already past that.
  let batch = db.batch();
  let pending = 0;
  const flush = async () => {
    if (pending === 0 || options.dryRun) return;
    await batch.commit();
    batch = db.batch();
    pending = 0;
  };

  for (const document of documents) {
    const data = clean(document.data);
    const current = existingById.get(document.id);
    if (current && JSON.stringify(current) === JSON.stringify(data)) {
      report.unchanged += 1;
      continue;
    }
    if (current) report.updated += 1;
    else report.created += 1;

    batch.set(collection.doc(document.id), data);
    pending += 1;
    if (pending >= 450) await flush();
  }

  if (options.prune) {
    const seeded = new Set(documents.map((document) => document.id));
    for (const id of existingById.keys()) {
      if (seeded.has(id)) continue;
      report.deleted += 1;
      batch.delete(collection.doc(id));
      pending += 1;
      if (pending >= 450) await flush();
    }
  }

  await flush();
  return report;
}

function line(label: string, report: WriteReport): string {
  const parts = [
    `${report.created} new`,
    `${report.updated} updated`,
    `${report.unchanged} unchanged`,
  ];
  if (report.deleted) parts.push(`${report.deleted} deleted`);
  return `${label.padEnd(22)} ${parts.join(' · ')}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { db, projectId } = connect();

  console.log(`project: ${projectId}${options.dryRun ? '  (dry run, nothing is written)' : ''}`);
  console.log(`seeding: ${options.only.join(', ')}\n`);

  if (options.only.includes('taxonomy')) {
    // The taxonomy lives at taxonomy/{kind}/{itemId}, which the rules already
    // expose as world-readable and admin-writable.
    const groups: Array<[string, Array<{ id: string }>]> = [
      ['categories', CATEGORIES],
      ['stacks', STACKS],
      ['difficulties', DIFFICULTIES],
      ['contentTypes', CONTENT_TYPES],
      ['skills', SKILLS],
      ['mockBlueprints', MOCK_BLUEPRINTS],
    ];
    for (const [kind, items] of groups) {
      const report = await upsert(
        db,
        `taxonomy/${kind}/items`,
        items.map((item) => ({ id: item.id, data: item as unknown as Record<string, unknown> })),
        options,
      );
      console.log(line(`taxonomy/${kind}`, report));
    }
  }

  if (options.only.includes('sources')) {
    const report = await upsert(
      db,
      'sources',
      SOURCES.map((source) => ({ id: source.id, data: source as unknown as Record<string, unknown> })),
      options,
    );
    console.log(line('sources', report));
  }

  if (options.only.includes('content')) {
    const report = await upsert(
      db,
      'content',
      SEED_CONTENT.map((item) => ({ id: item.id, data: item as unknown as Record<string, unknown> })),
      options,
    );
    console.log(line('content', report));
  }

  if (options.only.includes('paths')) {
    const report = await upsert(
      db,
      'learningPaths',
      LEARNING_PATHS.map((path) => ({ id: path.id, data: path as unknown as Record<string, unknown> })),
      options,
    );
    console.log(line('learningPaths', report));
  }

  console.log('\ndone.');
}

main().catch((error: unknown) => {
  console.error('\nseed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
