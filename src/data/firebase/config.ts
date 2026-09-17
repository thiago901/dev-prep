import type { FirebaseApp } from 'firebase/app';
import { firebaseConfigValues, isFirebaseConfigured } from './env';

/**
 * Firebase app initialisation.
 *
 * The SDK is imported dynamically so a local-mode install never downloads it.
 * `ensureFirebaseApp` is the entry point; `getFirebaseAppSync` exists for the
 * repositories, which run after initialisation has already been awaited.
 */

let app: FirebaseApp | null = null;
let pending: Promise<FirebaseApp | null> | null = null;

export async function ensureFirebaseApp(): Promise<FirebaseApp | null> {
  if (!isFirebaseConfigured) return null;
  if (app) return app;

  if (!pending) {
    pending = import('firebase/app').then((module) => {
      app = module.initializeApp({
        apiKey: firebaseConfigValues.apiKey!,
        authDomain: firebaseConfigValues.authDomain!,
        projectId: firebaseConfigValues.projectId!,
        storageBucket: firebaseConfigValues.storageBucket,
        messagingSenderId: firebaseConfigValues.messagingSenderId,
        appId: firebaseConfigValues.appId!,
        measurementId: firebaseConfigValues.measurementId,
      });
      return app;
    });
  }

  return pending;
}

/** The already-initialised app, or null. Never triggers a download. */
export function getFirebaseAppSync(): FirebaseApp | null {
  return app;
}

export { isFirebaseConfigured, firebaseConfigValues };
