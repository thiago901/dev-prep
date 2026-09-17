import type { Entitlements, Plan } from './types';

/**
 * What each plan allows.
 *
 * The limits live here rather than scattered through screens so that a future
 * Remote Config or subscription webhook has exactly one place to change, and so
 * that the free tier stays genuinely usable rather than a demo.
 */

const FREE: Entitlements = {
  plan: 'free',
  // Enough to hold a real attempt history for the questions being worked on,
  // without letting the device fill up silently.
  maxStoredRecordings: 30,
  maxRecordingMs: 4 * 60 * 1000,
  mockInterviewsPerWeek: 2,
  showAds: true,
  advancedAnalytics: false,
  aiEvaluation: false,
};

const PREMIUM: Entitlements = {
  plan: 'premium',
  maxStoredRecordings: 1000,
  maxRecordingMs: 15 * 60 * 1000,
  mockInterviewsPerWeek: Number.POSITIVE_INFINITY,
  showAds: false,
  advancedAnalytics: true,
  aiEvaluation: true,
};

export function entitlementsFor(plan: Plan): Entitlements {
  return plan === 'premium' ? PREMIUM : FREE;
}

/**
 * Whether an ad may render in a given place.
 *
 * Expressed as an allowlist rather than a denylist: a new surface is ad-free
 * until somebody deliberately adds it here, which is the safe default for a
 * product whose first principle is that nothing stands between the user and
 * their answer.
 */
export type AdSlot = 'library-footer' | 'progress-footer' | 'session-complete';

const AD_SLOTS: readonly AdSlot[] = ['library-footer', 'progress-footer', 'session-complete'];

export function canShowAd(entitlements: Entitlements, slot: AdSlot): boolean {
  return entitlements.showAds && AD_SLOTS.includes(slot);
}

export interface RecordingQuota {
  used: number;
  limit: number;
  remaining: number;
  atLimit: boolean;
  /** The oldest recordings that would be dropped to make room. */
  overflowBy: number;
}

export function recordingQuota(entitlements: Entitlements, stored: number): RecordingQuota {
  const remaining = Math.max(0, entitlements.maxStoredRecordings - stored);
  return {
    used: stored,
    limit: entitlements.maxStoredRecordings,
    remaining,
    atLimit: remaining === 0,
    overflowBy: Math.max(0, stored - entitlements.maxStoredRecordings),
  };
}
