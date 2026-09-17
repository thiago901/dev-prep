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

/**
 * The boundary between the app and wherever data actually lives.
 *
 * Every screen and hook talks to these interfaces. There are two
 * implementations — one entirely on this device, one on Firebase — and the app
 * picks between them at startup. Nothing above this line knows which is active.
 */

export interface ContentRepository {
  /** Every published content item. */
  list(): Promise<Content[]>;
  getById(id: string): Promise<Content | null>;
}

/**
 * Everything the user produces. Loaded as one snapshot at startup because it is
 * small, read constantly, and needed by nearly every screen at once.
 */
export interface StudySnapshot {
  progress: Record<string, ContentProgress>;
  attempts: Attempt[];
  recordings: Recording[];
  favorites: string[];
  sessions: StudySession[];
  mockInterviews: MockInterview[];
  profile: UserProfile | null;
  settings: UserSettings | null;
  /** Most recent first. */
  practiceSessions: PracticeSession[];
  practicePreferences: PracticePreferences | null;
}

export const EMPTY_SNAPSHOT: StudySnapshot = {
  progress: {},
  attempts: [],
  recordings: [],
  favorites: [],
  sessions: [],
  mockInterviews: [],
  profile: null,
  settings: null,
  practiceSessions: [],
  practicePreferences: null,
};

export interface StudyRepository {
  load(): Promise<StudySnapshot>;
  saveProgress(progress: ContentProgress): Promise<void>;
  saveAttempt(attempt: Attempt): Promise<void>;
  deleteAttempt(attemptId: string): Promise<void>;
  saveRecording(recording: Recording): Promise<void>;
  deleteRecording(recordingId: string): Promise<void>;
  setFavorites(contentIds: string[]): Promise<void>;
  saveSession(session: StudySession): Promise<void>;
  saveMockInterview(mock: MockInterview): Promise<void>;
  saveProfile(profile: UserProfile): Promise<void>;
  saveSettings(settings: UserSettings): Promise<void>;
  savePracticeSession(session: PracticeSession): Promise<void>;
  savePracticePreferences(preferences: PracticePreferences): Promise<void>;
  /** Removes everything this user produced. Used by "clear my data". */
  clear(): Promise<void>;
}

/**
 * Audio blobs, kept separate from the metadata because they are large, binary,
 * and in local mode never leave the device.
 */
export interface RecordingBlobStore {
  put(recordingId: string, blob: Blob): Promise<void>;
  get(recordingId: string): Promise<Blob | null>;
  delete(recordingId: string): Promise<void>;
  clear(): Promise<void>;
  /** Total bytes held, so the UI can be honest about storage use. */
  usedBytes(): Promise<number>;
}
