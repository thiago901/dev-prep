import type { Content } from '@/domain/types';

export {
  CATEGORIES,
  CONTENT_TYPES,
  DIFFICULTIES,
  MOCK_BLUEPRINTS,
  SKILLS,
  STACKS,
} from './taxonomy';

/**
 * Loads the bundled content bank.
 *
 * Dynamic on purpose — see contentBank.ts. The promise is cached so several
 * screens asking at once share one network round trip.
 */
let cached: Promise<{ all: Content[]; byId: Map<string, Content> }> | null = null;

export function loadSeedContent(): Promise<{ all: Content[]; byId: Map<string, Content> }> {
  if (!cached) {
    cached = import('./contentBank').then((module) => ({
      all: module.SEED_CONTENT,
      byId: module.SEED_CONTENT_BY_ID,
    }));
  }
  return cached;
}
