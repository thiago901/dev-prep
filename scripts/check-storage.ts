/**
 * Regression check for the local study repository.
 * Run: npx tsx scripts/check-storage.ts
 *
 * Concurrent writes used to start from the same stale snapshot, so saving an
 * attempt and its progress together silently erased the attempt. Under node
 * there is no IndexedDB, which exercises the in-memory path — exactly where the
 * lost update happened.
 */
import { LocalStudyRepository } from '../src/data/local/localRepositories';
import { createProgress } from '../src/domain/srs';
import type { Attempt } from '../src/domain/types';
import type { PracticeSession } from '../src/domain/practice';

const repo = new LocalStudyRepository();

const attempt = (id: string): Attempt => ({
  id,
  contentId: 'js-event-loop-order',
  createdAt: new Date().toISOString(),
  mode: 'silent',
  locale: 'pt',
  durationMs: 0,
  recordingId: null,
  confidence: null,
  revealed: false,
  starred: false,
});

const session: PracticeSession = {
  id: 'prc_test',
  day: '2026-09-16',
  size: 5,
  createdAt: new Date().toISOString(),
  completedAt: null,
  endedEarly: false,
  position: 0,
  items: [],
};

await Promise.all([
  repo.saveAttempt(attempt('att_1')),
  repo.saveProgress(createProgress('js-event-loop-order')),
  repo.savePracticeSession(session),
  repo.saveAttempt(attempt('att_2')),
  repo.setFavorites(['sec-idor']),
]);

const snapshot = await repo.load();
const failures = [
  snapshot.attempts.length === 2 ? null : `expected 2 attempts, got ${snapshot.attempts.length}`,
  snapshot.progress['js-event-loop-order'] ? null : 'progress was lost',
  snapshot.practiceSessions.length === 1 ? null : `expected 1 session, got ${snapshot.practiceSessions.length}`,
  snapshot.favorites.includes('sec-idor') ? null : 'favourite was lost',
].filter(Boolean);

if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}
console.log('concurrent writes preserved: 2 attempts, progress, session, favourite');
process.exit(0);
