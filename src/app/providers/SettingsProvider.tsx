import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Locale, UserSettings } from '@/domain/types';
import { I18nProvider } from '@/i18n';

/**
 * Theme and language.
 *
 * These are resolved before first paint by an inline script in index.html, so
 * this provider adopts whatever that script decided rather than re-deciding and
 * causing a flash.
 */

type Theme = 'dark' | 'light';

interface SettingsValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  answerLocale: Locale;
  setAnswerLocale: (locale: Locale) => void;
  defaultAttemptMode: UserSettings['defaultAttemptMode'];
  setDefaultAttemptMode: (mode: UserSettings['defaultAttemptMode']) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

const THEME_KEY = 'devprep.theme';
const LOCALE_KEY = 'devprep.locale';
const ANSWER_LOCALE_KEY = 'devprep.answerLocale';
const ATTEMPT_MODE_KEY = 'devprep.attemptMode';

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return allowed.includes(stored as T) ? (stored as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked. The preference still applies for this session.
  }
}

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'pt' || stored === 'en') return stored;
  } catch {
    // fall through to the browser's preference
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const fromDom = document.documentElement.dataset.theme;
    if (fromDom === 'light' || fromDom === 'dark') return fromDom;
    return read(THEME_KEY, ['dark', 'light'] as const, 'dark');
  });

  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const [answerLocale, setAnswerLocaleState] = useState<Locale>(() =>
    read(ANSWER_LOCALE_KEY, ['pt', 'en'] as const, detectLocale()),
  );
  const [defaultAttemptMode, setDefaultAttemptModeState] = useState<
    UserSettings['defaultAttemptMode']
  >(() => read(ATTEMPT_MODE_KEY, ['spoken', 'silent'] as const, 'spoken'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    // Keep the browser chrome in step with the booth.
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    meta?.setAttribute('content', theme === 'dark' ? '#110D0A' : '#E8E3D9');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    write(THEME_KEY, next);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    write(LOCALE_KEY, next);
  }, []);

  const setAnswerLocale = useCallback((next: Locale) => {
    setAnswerLocaleState(next);
    write(ANSWER_LOCALE_KEY, next);
  }, []);

  const setDefaultAttemptMode = useCallback((next: UserSettings['defaultAttemptMode']) => {
    setDefaultAttemptModeState(next);
    write(ATTEMPT_MODE_KEY, next);
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      locale,
      setLocale,
      answerLocale,
      setAnswerLocale,
      defaultAttemptMode,
      setDefaultAttemptMode,
    }),
    [
      theme,
      setTheme,
      locale,
      setLocale,
      answerLocale,
      setAnswerLocale,
      defaultAttemptMode,
      setDefaultAttemptMode,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      <I18nProvider locale={locale} setLocale={setLocale}>
        {children}
      </I18nProvider>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider.');
  return value;
}
