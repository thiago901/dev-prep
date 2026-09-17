import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import {
  deleteObject,
  getBlob,
  getStorage,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from 'firebase/storage';
import type {
  Attempt,
  Content,
  ContentProgress,
  MockInterview,
  Recording,
  StudySession,
  UserProfile,
  UserSettings,
} from '@/domain/types';
import type { PracticePreferences, PracticeSession } from '@/domain/practice';
import {
  EMPTY_SNAPSHOT,
  type ContentRepository,
  type RecordingBlobStore,
  type StudyRepository,
  type StudySnapshot,
} from '@/data/ports';
import { getFirebaseAppSync } from './config';

function db(): Firestore {
  const app = getFirebaseAppSync();
  if (!app) throw new Error('Firebase is not initialised.');
  return getFirestore(app);
}

function storage(): FirebaseStorage {
  const app = getFirebaseAppSync();
  if (!app) throw new Error('Firebase is not initialised.');
  return getStorage(app);
}

/** Published content from Firestore. Falls back to the seed bank on failure. */
export class FirestoreContentRepository implements ContentRepository {
  constructor(private readonly fallback: ContentRepository) {}

  async list(): Promise<Content[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db(), 'content'), where('status', '==', 'published')),
      );
      if (snapshot.empty) return this.fallback.list();
      return snapshot.docs.map((docSnap) => docSnap.data() as Content);
    } catch {
      // An unseeded or unreachable project must not leave the user with an
      // empty library; the bundled bank is a better answer than an error.
      return this.fallback.list();
    }
  }

  async getById(id: string): Promise<Content | null> {
    try {
      const snapshot = await getDoc(doc(db(), 'content', id));
      if (snapshot.exists()) return snapshot.data() as Content;
    } catch {
      // fall through
    }
    return this.fallback.getById(id);
  }
}

/**
 * Study state in Firestore, scoped under the signed-in user.
 *
 * Writes are per-document rather than whole-snapshot, because two devices can
 * be editing at once and the security rules are written per collection.
 */
export class FirestoreStudyRepository implements StudyRepository {
  constructor(private readonly uid: string) {}

  private userDoc() {
    return doc(db(), 'users', this.uid);
  }

  private sub(name: string) {
    return collection(db(), 'users', this.uid, name);
  }

  async load(): Promise<StudySnapshot> {
    const [progress, attempts, recordings, favorites, sessions, mocks, profile, settings, practice, practicePrefs] =
      await Promise.all([
        getDocs(this.sub('progress')),
        getDocs(this.sub('attempts')),
        getDocs(this.sub('recordings')),
        getDocs(this.sub('favorites')),
        getDocs(this.sub('sessions')),
        getDocs(this.sub('mockInterviews')),
        getDoc(this.userDoc()),
        getDoc(doc(db(), 'users', this.uid, 'settings', 'preferences')),
        getDocs(this.sub('practiceSessions')),
        getDoc(doc(db(), 'users', this.uid, 'settings', 'practice')),
      ]);

    return {
      ...EMPTY_SNAPSHOT,
      progress: Object.fromEntries(
        progress.docs.map((item) => [item.id, item.data() as ContentProgress]),
      ),
      attempts: attempts.docs
        .map((item) => item.data() as Attempt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      recordings: recordings.docs.map((item) => item.data() as Recording),
      favorites: favorites.docs.map((item) => item.id),
      sessions: sessions.docs.map((item) => item.data() as StudySession),
      mockInterviews: mocks.docs.map((item) => item.data() as MockInterview),
      profile: profile.exists() ? (profile.data() as UserProfile) : null,
      settings: settings.exists() ? (settings.data() as UserSettings) : null,
      practiceSessions: practice.docs
        .map((item) => item.data() as PracticeSession)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      practicePreferences: practicePrefs.exists() ? (practicePrefs.data() as PracticePreferences) : null,
    };
  }

  async saveProgress(progress: ContentProgress): Promise<void> {
    await setDoc(doc(this.sub('progress'), progress.contentId), progress);
  }

  async saveAttempt(attempt: Attempt): Promise<void> {
    await setDoc(doc(this.sub('attempts'), attempt.id), attempt);
  }

  async deleteAttempt(attemptId: string): Promise<void> {
    await deleteDoc(doc(this.sub('attempts'), attemptId));
  }

  async saveRecording(recording: Recording): Promise<void> {
    await setDoc(doc(this.sub('recordings'), recording.id), recording);
  }

  async deleteRecording(recordingId: string): Promise<void> {
    await deleteDoc(doc(this.sub('recordings'), recordingId));
  }

  async setFavorites(contentIds: string[]): Promise<void> {
    const existing = await getDocs(this.sub('favorites'));
    const next = new Set(contentIds);

    await Promise.all([
      ...existing.docs
        .filter((item) => !next.has(item.id))
        .map((item) => deleteDoc(item.ref)),
      ...contentIds.map((id) =>
        setDoc(doc(this.sub('favorites'), id), { contentId: id, createdAt: new Date().toISOString() }),
      ),
    ]);
  }

  async saveSession(session: StudySession): Promise<void> {
    await setDoc(doc(this.sub('sessions'), session.id), session);
  }

  async saveMockInterview(mock: MockInterview): Promise<void> {
    await setDoc(doc(this.sub('mockInterviews'), mock.id), mock);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await setDoc(this.userDoc(), profile, { merge: true });
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    await setDoc(doc(db(), 'users', this.uid, 'settings', 'preferences'), settings);
  }

  async savePracticeSession(session: PracticeSession): Promise<void> {
    await setDoc(doc(this.sub('practiceSessions'), session.id), session);
  }

  async savePracticePreferences(preferences: PracticePreferences): Promise<void> {
    await setDoc(doc(db(), 'users', this.uid, 'settings', 'practice'), preferences);
  }

  async clear(): Promise<void> {
    const names = ['progress', 'attempts', 'recordings', 'favorites', 'sessions', 'mockInterviews', 'practiceSessions'];
    for (const name of names) {
      const snapshot = await getDocs(this.sub(name));
      await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
    }
  }
}

/**
 * Recordings in Firebase Storage.
 *
 * Local copies are kept as well, so playback stays instant and works offline;
 * Storage is the copy that survives losing the device.
 */
export class FirebaseRecordingBlobStore implements RecordingBlobStore {
  constructor(
    private readonly uid: string,
    private readonly local: RecordingBlobStore,
  ) {}

  private path(recordingId: string): string {
    return `recordings/${this.uid}/${recordingId}.webm`;
  }

  async put(recordingId: string, blob: Blob): Promise<void> {
    await this.local.put(recordingId, blob);
    try {
      await uploadBytes(ref(storage(), this.path(recordingId)), blob, {
        contentType: blob.type || 'audio/webm',
      });
    } catch {
      // The local copy already succeeded, so the take is not lost. Sync state
      // is surfaced in the UI rather than thrown at the user mid-recording.
    }
  }

  async get(recordingId: string): Promise<Blob | null> {
    const local = await this.local.get(recordingId);
    if (local) return local;

    try {
      const blob = await getBlob(ref(storage(), this.path(recordingId)));
      await this.local.put(recordingId, blob);
      return blob;
    } catch {
      return null;
    }
  }

  async delete(recordingId: string): Promise<void> {
    await this.local.delete(recordingId);
    try {
      await deleteObject(ref(storage(), this.path(recordingId)));
    } catch {
      // Already gone, or never uploaded.
    }
  }

  async clear(): Promise<void> {
    await this.local.clear();
  }

  usedBytes(): Promise<number> {
    return this.local.usedBytes();
  }
}
