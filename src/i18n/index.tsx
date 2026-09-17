import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Locale, LocalizedList, LocalizedText } from '@/domain/types';
import { STRINGS, type StringKey } from './strings';

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** UI chrome string, with optional `{placeholder}` substitution. */
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
  /**
   * Authored content in the reader's language, falling back to the other one
   * when a piece was only written in a single language. Content is authored,
   * not translated, so a missing language is a real state rather than a bug.
   */
  text: (value: LocalizedText | undefined, preferred?: Locale) => string;
  list: (value: LocalizedList | undefined, preferred?: Locale) => string[];
  /** True when the returned text is not in the requested language. */
  isFallback: (value: LocalizedText | undefined, preferred?: Locale) => boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function I18nProvider({
  locale,
  setLocale,
  children,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  children: ReactNode;
}) {
  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) =>
      interpolate(STRINGS[key][locale], vars),
    [locale],
  );

  const text = useCallback(
    (value: LocalizedText | undefined, preferred?: Locale) => {
      if (!value) return '';
      const want = preferred ?? locale;
      return value[want] ?? value[want === 'pt' ? 'en' : 'pt'] ?? '';
    },
    [locale],
  );

  const list = useCallback(
    (value: LocalizedList | undefined, preferred?: Locale) => {
      if (!value) return [];
      const want = preferred ?? locale;
      return value[want] ?? value[want === 'pt' ? 'en' : 'pt'] ?? [];
    },
    [locale],
  );

  const isFallback = useCallback(
    (value: LocalizedText | undefined, preferred?: Locale) => {
      if (!value) return false;
      const want = preferred ?? locale;
      return !value[want];
    },
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t, text, list, isFallback }),
    [locale, setLocale, t, text, list, isFallback],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider.');
  return value;
}

export type { StringKey };
