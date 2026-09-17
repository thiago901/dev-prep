import type {
  Content,
  MockBlueprint,
  MockInterview,
  MockSummary,
} from './types';
import type { StudyIndex } from './selectors';
import { computeSkillLevels, stateOf } from './selectors';

/**
 * Mock interview composition and debrief.
 *
 * A blueprint describes the shape of a round; this fills each slot from the
 * available content, preferring questions the user has not mastered so the
 * session is a rehearsal rather than a victory lap.
 */

export function composeMockInterview(
  index: StudyIndex,
  blueprint: MockBlueprint,
  random: () => number = Math.random,
): Array<{ content: Content; slotLabel: MockBlueprint['slots'][number]['label'] }> {
  const used = new Set<string>();
  const picked: Array<{ content: Content; slotLabel: MockBlueprint['slots'][number]['label'] }> = [];

  for (const slot of blueprint.slots) {
    const candidates = index.content.filter((item) => {
      if (used.has(item.id)) return false;
      if (slot.types.length && !slot.types.includes(item.type)) return false;
      if (slot.categoryIds?.length && !slot.categoryIds.includes(item.categoryId)) return false;
      if (slot.difficulty?.length && !slot.difficulty.includes(item.difficulty)) return false;
      if (slot.locale && !item.languages.includes(slot.locale)) return false;
      return true;
    });

    if (candidates.length === 0) continue;

    // Prefer what is not yet mastered; fall back to the whole pool rather than
    // leaving a slot empty, because a short round reads as a broken feature.
    const unmastered = candidates.filter((item) => stateOf(index, item.id) !== 'mastered');
    const pool = unmastered.length > 0 ? unmastered : candidates;
    const chosen = pool[Math.floor(random() * pool.length)];

    used.add(chosen.id);
    picked.push({ content: chosen, slotLabel: slot.label });
  }

  return picked;
}

export function summariseMock(mock: MockInterview, index: StudyIndex): MockSummary {
  const answered = mock.items.filter((item) => !item.skipped && item.attemptId);
  const totalMs = answered.reduce((sum, item) => sum + item.durationMs, 0);

  const sorted = [...answered].sort((a, b) => a.durationMs - b.durationMs);

  // The skills the round actually exercised, ranked by current level. A round
  // cannot tell you about skills it did not test.
  const touchedSkills = new Set<string>();
  for (const item of mock.items) {
    const content = index.byId.get(item.contentId);
    content?.skillIds.forEach((skillId) => touchedSkills.add(skillId));
  }

  const weakSkillIds = computeSkillLevels(index)
    .filter((level) => touchedSkills.has(level.skillId))
    .sort((a, b) => a.level - b.level)
    .slice(0, 3)
    .map((level) => level.skillId);

  // Anything skipped, plus anything answered unusually fast, is worth another
  // look: a twenty-second answer to a system design prompt is a signal.
  const reviewContentIds = mock.items
    .filter((item) => item.skipped || (item.durationMs > 0 && item.durationMs < 25_000))
    .map((item) => item.contentId);

  return {
    answered: answered.length,
    skipped: mock.items.filter((item) => item.skipped).length,
    totalMs,
    averageMs: answered.length ? Math.round(totalMs / answered.length) : 0,
    longestContentId: sorted.at(-1)?.contentId ?? null,
    shortestContentId: sorted.at(0)?.contentId ?? null,
    weakSkillIds,
    reviewContentIds,
  };
}
