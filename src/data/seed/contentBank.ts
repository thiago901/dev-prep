import type { Content } from '@/domain/types';
import { JAVASCRIPT_CONTENT } from './content/javascript';
import { BACKEND_CONTENT } from './content/backend';
import { DATABASE_CONTENT } from './content/database';
import { ARCHITECTURE_CONTENT } from './content/architecture';
import { SECURITY_CONTENT } from './content/security';
import { BEHAVIORAL_CONTENT } from './content/behavioral';
import { ENGLISH_CONTENT } from './content/english';
import { LADDER_CONTENT } from './content/ladder';
import { QUALITY_CONTENT } from './content/quality';
import { DDD_CONTENT } from './content/ddd';
import { SCALE_CONTENT } from './content/scale';
import { WEB_CONTENT } from './content/web';
import { DELIVERY_CONTENT } from './content/delivery';
import { ENGLISH_EXTRA_CONTENT } from './content/english-extra';

/**
 * The seed content bank.
 *
 * Kept in its own module and only ever imported dynamically: the authored
 * answers are several hundred kilobytes of text, and none of it is needed to
 * paint the first screen. Loading it as its own chunk is the difference
 * between a fast first session on a mid-range phone and a slow one.
 */
export const SEED_CONTENT: Content[] = [
  ...JAVASCRIPT_CONTENT,
  ...BACKEND_CONTENT,
  ...DATABASE_CONTENT,
  ...ARCHITECTURE_CONTENT,
  ...SECURITY_CONTENT,
  ...BEHAVIORAL_CONTENT,
  ...ENGLISH_CONTENT,
  ...LADDER_CONTENT,
  ...QUALITY_CONTENT,
  ...DDD_CONTENT,
  ...SCALE_CONTENT,
  ...WEB_CONTENT,
  ...DELIVERY_CONTENT,
  ...ENGLISH_EXTRA_CONTENT,
];

// Fails loudly during development if two items collide on a slug.
const seen = new Set<string>();
for (const item of SEED_CONTENT) {
  if (seen.has(item.id)) {
    throw new Error(`Duplicate content id in seed bank: ${item.id}`);
  }
  seen.add(item.id);
}

export const SEED_CONTENT_BY_ID = new Map(SEED_CONTENT.map((item) => [item.id, item]));
