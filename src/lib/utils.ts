import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Short, sortable, collision-resistant enough for per-device records. */
export function createId(prefix = ''): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}${time}${random}`;
}

/** mm:ss, the format a transport counter uses. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Human-scale totals: "3 min", "1 h 20". */
export function formatTotalTime(ms: number, locale: string): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, locale === 'pt' ? '0' : '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

export function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A rough spoken word count from duration alone.
 *
 * Deliberately approximate and labelled as such in the UI: real transcription
 * belongs to a future evaluation service, and a fake-precise number would be
 * worse than an honest estimate. 130 wpm is a typical unrehearsed speaking pace
 * for a non-native speaker explaining something technical.
 */
export function estimateWords(durationMs: number): number {
  return Math.round((durationMs / 60000) * 130);
}

export function pacePerMinute(words: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return Math.round(words / (durationMs / 60000));
}
