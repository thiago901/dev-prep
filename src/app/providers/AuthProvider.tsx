import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { configureRepositories } from '@/data';
import { isFirebaseConfigured } from '@/data/firebase/env';
import type { StringKey } from '@/i18n';

/**
 * Authentication.
 *
 * Sign-in is optional by design: a guest gets the whole product, stored on
 * their device. When Firebase is not configured at all, this provider reports
 * that honestly rather than showing a sign-in form that cannot work.
 */

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type AuthErrorKey = Extract<StringKey, `auth.error.${string}`>;

interface AuthValue {
  user: AuthUser | null;
  /** True until the first auth state resolution, so guards do not flash. */
  loading: boolean;
  available: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: AuthErrorKey | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function mapAuthError(code: unknown): AuthErrorKey {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'auth.error.invalidCredentials';
    case 'auth/email-already-in-use':
      return 'auth.error.emailInUse';
    case 'auth/weak-password':
      return 'auth.error.weakPassword';
    case 'auth/network-request-failed':
      return 'auth.error.network';
    default:
      return 'auth.error.generic';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<AuthErrorKey | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Local mode: repositories are already correct, and there is nothing to
      // wait for. Resolving immediately keeps the first paint fast.
      void configureRepositories(null);
      setLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      const [{ getAuth, onAuthStateChanged }, { ensureFirebaseApp }] = await Promise.all([
        import('firebase/auth'),
        import('@/data/firebase/config'),
      ]);

      const app = await ensureFirebaseApp();
      if (!app || !active) return;

      const unsubscribe = onAuthStateChanged(getAuth(app), async (firebaseUser) => {
        if (!active) return;
        const next = firebaseUser
          ? {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            }
          : null;

        await configureRepositories(next?.uid ?? null);
        setUser(next);
        setLoading(false);
      });

      return () => unsubscribe();
    })();

    return () => {
      active = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const [{ getAuth, GoogleAuthProvider, signInWithPopup }, { ensureFirebaseApp }] =
        await Promise.all([import('firebase/auth'), import('@/data/firebase/config')]);
      const app = await ensureFirebaseApp();
      if (!app) throw new Error('unavailable');
      await signInWithPopup(getAuth(app), new GoogleAuthProvider());
    } catch (cause) {
      setError(mapAuthError((cause as { code?: string })?.code));
      throw cause;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const [{ getAuth, signInWithEmailAndPassword }, { ensureFirebaseApp }] = await Promise.all([
        import('firebase/auth'),
        import('@/data/firebase/config'),
      ]);
      const app = await ensureFirebaseApp();
      if (!app) throw new Error('unavailable');
      await signInWithEmailAndPassword(getAuth(app), email, password);
    } catch (cause) {
      setError(mapAuthError((cause as { code?: string })?.code));
      throw cause;
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name: string) => {
      setError(null);
      try {
        const [{ getAuth, createUserWithEmailAndPassword, updateProfile }, { ensureFirebaseApp }] =
          await Promise.all([import('firebase/auth'), import('@/data/firebase/config')]);
        const app = await ensureFirebaseApp();
        if (!app) throw new Error('unavailable');
        const credential = await createUserWithEmailAndPassword(getAuth(app), email, password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
      } catch (cause) {
        setError(mapAuthError((cause as { code?: string })?.code));
        throw cause;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const [{ getAuth, signOut: firebaseSignOut }, { ensureFirebaseApp }] = await Promise.all([
      import('firebase/auth'),
      import('@/data/firebase/config'),
    ]);
    const app = await ensureFirebaseApp();
    if (!app) return;
    await firebaseSignOut(getAuth(app));
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      available: isFirebaseConfigured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      error,
      clearError: () => setError(null),
    }),
    [user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
