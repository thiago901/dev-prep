import type { Content } from '@/domain/types';
import { loadSeedContent } from '@/data/seed';
import {
  EMPTY_SNAPSHOT,
  type ContentRepository,
  type RecordingBlobStore,
  type StudyRepository,
  type StudySnapshot,
} from '@/data/ports';
import { BLOB_STORE, KV_STORE, idb } from './idb';

/** Content bundled with the app. Used until a Firestore project is configured. */
export class SeedContentRepository implements ContentRepository {
  async list(): Promise<Content[]> {
    const { all } = await loadSeedContent();
    return all;
  }

  async getById(id: string): Promise<Content | null> {
    const { byId } = await loadSeedContent();
    return byId.get(id) ?? null;
  }
}

const SNAPSHOT_KEY = 'snapshot';
const LEGACY_LS_KEY = 'devprep.snapshot';

/**
 * Study state held on this device.
 *
 * The whole snapshot is written on every change. That is a deliberate
 * simplification: the object is a few hundred kilobytes at most, writes are
 * debounced, and it removes an entire category of partial-write bugs. If it
 * ever outgrows that, the shape below is already the one Firestore uses.
 */
export class LocalStudyRepository implements StudyRepository {
  private cache: StudySnapshot | null = null;
  private writeTimer: ReturnType<typeof setTimeout> | null = null;
  private writeChain: Promise<void> = Promise.resolve();

  async load(): Promise<StudySnapshot> {
    if (this.cache) return this.cache;

    let stored: StudySnapshot | undefined;
    try {
      // Some private windows and sandboxed frames never answer an IndexedDB
      // open at all — no success, no error. Without a bound, the booth would
      // sit on its loading state forever.
      stored = await Promise.race([
        idb.get<StudySnapshot>(KV_STORE, SNAPSHOT_KEY),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('IndexedDB did not respond.')), 2500),
        ),
      ]);
    } catch {
      // IndexedDB can be unavailable in a private window or a locked-down
      // frame. Fall back rather than losing the session entirely.
      stored = readLocalStorageFallback();
    }

    this.cache = stored ? { ...EMPTY_SNAPSHOT, ...stored } : { ...EMPTY_SNAPSHOT };
    return this.cache;
  }

  private async mutate(change: (snapshot: StudySnapshot) => StudySnapshot): Promise<void> {
    await this.load();
    // Apply the change to the cache as it is *now*, not to a copy captured
    // before the await: concurrent writes (an attempt and its progress are
    // saved together) otherwise each start from the same stale snapshot and
    // the later one silently erases the earlier.
    this.cache = change(this.cache ?? { ...EMPTY_SNAPSHOT });
    this.scheduleFlush();
  }

  /** Coalesces rapid updates — grading a card touches three collections. */
  private scheduleFlush(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      void this.flush();
    }, 120);
  }

  private flush(): Promise<void> {
    const snapshot = this.cache;
    if (!snapshot) return Promise.resolve();

    this.writeChain = this.writeChain
      .then(() => idb.put(KV_STORE, SNAPSHOT_KEY, snapshot))
      .catch(() => writeLocalStorageFallback(snapshot));

    return this.writeChain;
  }

  async saveProgress(progress: StudySnapshot['progress'][string]): Promise<void> {
    await this.mutate((snapshot) => ({
      ...snapshot,
      progress: { ...snapshot.progress, [progress.contentId]: progress },
    }));
  }

  async saveAttempt(attempt: StudySnapshot['attempts'][number]): Promise<void> {
    await this.mutate((snapshot) => {
      const without = snapshot.attempts.filter((item) => item.id !== attempt.id);
      return { ...snapshot, attempts: [attempt, ...without] };
    });
  }

  async deleteAttempt(attemptId: string): Promise<void> {
    await this.mutate((snapshot) => ({
      ...snapshot,
      attempts: snapshot.attempts.filter((item) => item.id !== attemptId),
      recordings: snapshot.recordings.filter((item) => item.attemptId !== attemptId),
    }));
  }

  async saveRecording(recording: StudySnapshot['recordings'][number]): Promise<void> {
    await this.mutate((snapshot) => {
      const without = snapshot.recordings.filter((item) => item.id !== recording.id);
      return { ...snapshot, recordings: [recording, ...without] };
    });
  }

  async deleteRecording(recordingId: string): Promise<void> {
    await this.mutate((snapshot) => ({
      ...snapshot,
      recordings: snapshot.recordings.filter((item) => item.id !== recordingId),
    }));
  }

  async setFavorites(contentIds: string[]): Promise<void> {
    await this.mutate((snapshot) => ({ ...snapshot, favorites: contentIds }));
  }

  async saveSession(session: StudySnapshot['sessions'][number]): Promise<void> {
    await this.mutate((snapshot) => {
      const without = snapshot.sessions.filter((item) => item.id !== session.id);
      // Sessions are only used for study-time totals; the oldest ones stop
      // being interesting long before they stop taking up space.
      return { ...snapshot, sessions: [session, ...without].slice(0, 200) };
    });
  }

  async saveMockInterview(mock: StudySnapshot['mockInterviews'][number]): Promise<void> {
    await this.mutate((snapshot) => {
      const without = snapshot.mockInterviews.filter((item) => item.id !== mock.id);
      return { ...snapshot, mockInterviews: [mock, ...without].slice(0, 50) };
    });
  }

  async saveProfile(profile: NonNullable<StudySnapshot['profile']>): Promise<void> {
    await this.mutate((snapshot) => ({ ...snapshot, profile }));
  }

  async saveSettings(settings: NonNullable<StudySnapshot['settings']>): Promise<void> {
    await this.mutate((snapshot) => ({ ...snapshot, settings }));
  }

  async savePracticeSession(session: StudySnapshot['practiceSessions'][number]): Promise<void> {
    await this.mutate((snapshot) => {
      const without = snapshot.practiceSessions.filter((item) => item.id !== session.id);
      // A few months of daily sessions is plenty for "don't repeat yesterday"
      // and for history; older ones only cost space.
      return { ...snapshot, practiceSessions: [session, ...without].slice(0, 120) };
    });
  }

  async savePracticePreferences(
    preferences: NonNullable<StudySnapshot['practicePreferences']>,
  ): Promise<void> {
    await this.mutate((snapshot) => ({ ...snapshot, practicePreferences: preferences }));
  }

  async clear(): Promise<void> {
    this.cache = { ...EMPTY_SNAPSHOT };
    await idb.put(KV_STORE, SNAPSHOT_KEY, this.cache).catch(() => undefined);
    try {
      localStorage.removeItem(LEGACY_LS_KEY);
    } catch {
      // Nothing to do: storage being unavailable is already the cleared state.
    }
  }
}

function readLocalStorageFallback(): StudySnapshot | undefined {
  try {
    const raw = localStorage.getItem(LEGACY_LS_KEY);
    return raw ? (JSON.parse(raw) as StudySnapshot) : undefined;
  } catch {
    return undefined;
  }
}

function writeLocalStorageFallback(snapshot: StudySnapshot): void {
  try {
    localStorage.setItem(LEGACY_LS_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota exceeded or storage blocked. The session still works in memory;
    // the UI surfaces persistence failures separately.
  }
}

/** Audio blobs on this device. In local mode they never leave it. */
export class LocalRecordingBlobStore implements RecordingBlobStore {
  async put(recordingId: string, blob: Blob): Promise<void> {
    await idb.put(BLOB_STORE, recordingId, blob);
  }

  async get(recordingId: string): Promise<Blob | null> {
    const blob = await idb.get<Blob>(BLOB_STORE, recordingId);
    return blob ?? null;
  }

  async delete(recordingId: string): Promise<void> {
    await idb.delete(BLOB_STORE, recordingId);
  }

  async clear(): Promise<void> {
    await idb.clear(BLOB_STORE);
  }

  async usedBytes(): Promise<number> {
    try {
      const blobs = await idb.values<Blob>(BLOB_STORE);
      return blobs.reduce((total, blob) => total + (blob?.size ?? 0), 0);
    } catch {
      return 0;
    }
  }
}
