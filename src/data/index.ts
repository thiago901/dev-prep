import type { ContentRepository, RecordingBlobStore, StudyRepository } from './ports';
import { isFirebaseConfigured } from './firebase/env';
import {
  LocalRecordingBlobStore,
  LocalStudyRepository,
  SeedContentRepository,
} from './local/localRepositories';

/**
 * Adapter selection.
 *
 * One place decides where data comes from. Screens import the resolved
 * repositories and never learn which implementation answered.
 */

const seedContent = new SeedContentRepository();
const localStudy = new LocalStudyRepository();
const localBlobs = new LocalRecordingBlobStore();

let contentRepository: ContentRepository = seedContent;
let studyRepository: StudyRepository = localStudy;
let recordingBlobStore: RecordingBlobStore = localBlobs;

/**
 * Called once the auth state is known.
 *
 * A signed-in user on a configured project gets Firebase. Everyone else —
 * unconfigured project, signed out, or a guest trying the product — gets the
 * local implementation, which is fully functional rather than a degraded mode.
 */
export async function configureRepositories(uid: string | null): Promise<void> {
  if (!isFirebaseConfigured || !uid) {
    contentRepository = seedContent;
    studyRepository = localStudy;
    recordingBlobStore = localBlobs;
    return;
  }

  // Loaded on demand so the Firestore and Storage chunks stay out of the
  // initial bundle for guests and for local-mode installs.
  const [{ ensureFirebaseApp }, { FirebaseRecordingBlobStore, FirestoreContentRepository, FirestoreStudyRepository }] =
    await Promise.all([import('./firebase/config'), import('./firebase/repositories')]);

  // The app has to exist before any repository touches Firestore or Storage.
  await ensureFirebaseApp();

  contentRepository = new FirestoreContentRepository(seedContent);
  studyRepository = new FirestoreStudyRepository(uid);
  recordingBlobStore = new FirebaseRecordingBlobStore(uid, localBlobs);
}

export const repositories = {
  get content(): ContentRepository {
    return contentRepository;
  },
  get study(): StudyRepository {
    return studyRepository;
  },
  get recordings(): RecordingBlobStore {
    return recordingBlobStore;
  },
  /** The local study store, needed when migrating a guest into an account. */
  get localStudy(): StudyRepository {
    return localStudy;
  },
};

export { isFirebaseConfigured };
export * from './ports';
