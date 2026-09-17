/**
 * Firebase configuration, read from the environment.
 *
 * Deliberately free of any Firebase import: the whole app needs to ask "is
 * Firebase configured?" on first paint, and if answering that pulled in the
 * SDK, every local-mode install would download 600 kB it never uses.
 */

export const firebaseConfigValues = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * True only when every required key is present. A partially filled `.env` is
 * treated as unconfigured rather than failing at the first call, because a
 * half-initialised Firebase throws from inside unrelated screens.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfigValues.apiKey &&
    firebaseConfigValues.authDomain &&
    firebaseConfigValues.projectId &&
    firebaseConfigValues.appId,
);
