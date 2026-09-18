import type {
  ActivityKind,
  AnswerLevel,
  Block,
  Content,
  ContentTypeId,
  DifficultyId,
  Locale,
  LocalizedList,
  LocalizedText,
  OptionQuality,
  ResponseMode,
} from '@/domain/types';

/**
 * Small authoring helpers for the seed content bank.
 *
 * Without these, every question is eighty lines of block plumbing and nobody
 * reads the actual interview material. Block ids are generated from the
 * content slug plus an index, so they are stable across edits as long as the
 * order holds, and an administrator editing through the builder gets the same
 * shape the seed produces.
 */

type Draft = { kind: Block['kind']; [key: string]: unknown };

export const t = (pt: string, en: string): LocalizedText => ({ pt, en });
export const list = (pt: string[], en: string[]): LocalizedList => ({ pt, en });

// --- prompt-side blocks ----------------------------------------------------

export const prompt = (text: LocalizedText, setup?: LocalizedText): Draft => ({
  kind: 'prompt',
  phase: 'prompt',
  text,
  ...(setup ? { setup } : {}),
});

export const code = (
  language: string,
  source: string,
  options: { caption?: LocalizedText; filename?: string; highlightLines?: number[]; phase?: 'prompt' | 'answer' } = {},
): Draft => ({
  kind: 'code',
  phase: options.phase ?? 'prompt',
  language,
  code: source.trim(),
  ...(options.caption ? { caption: options.caption } : {}),
  ...(options.filename ? { filename: options.filename } : {}),
  ...(options.highlightLines ? { highlightLines: options.highlightLines } : {}),
});

export const setupText = (text: LocalizedText, heading?: LocalizedText): Draft => ({
  kind: 'text',
  phase: 'prompt',
  text,
  ...(heading ? { heading } : {}),
});

export const choices = (
  multiple: boolean,
  options: Array<{
    id: string;
    label: LocalizedText;
    correct: boolean;
    /** Omit only when the option is plainly wrong or plainly the best. */
    quality?: OptionQuality;
    why: LocalizedText;
  }>,
): Draft => ({ kind: 'choices', phase: 'prompt', multiple, options });

/**
 * Yes/no statements, asked straight after the material. Ids are positional so
 * an author writes the question and nothing else.
 */
export const quickChecks = (
  questions: Array<{ statement: LocalizedText; answer: boolean; why: LocalizedText }>,
): Draft => ({
  kind: 'quick-check',
  phase: 'prompt',
  questions: questions.map((question, index) => ({ id: `q${index + 1}`, ...question })),
});

/** Decision cards. Both calls have to sound like something a developer says. */
export const decisions = (
  cards: Array<{
    statement: LocalizedText;
    expected: 'agree' | 'disagree';
    verdict: LocalizedText;
    why: LocalizedText;
    context?: LocalizedText;
    tradeOff?: LocalizedText;
  }>,
): Draft => ({
  kind: 'decision',
  phase: 'prompt',
  cards: cards.map((card, index) => ({ id: `d${index + 1}`, ...card })),
});

/** Prose on the prompt side. Learn cards are built out of these. */
export const note = (text: LocalizedText, heading?: LocalizedText): Draft => ({
  kind: 'text',
  phase: 'prompt',
  text,
  ...(heading ? { heading } : {}),
});

// --- answer-side blocks ----------------------------------------------------

export const answers = (levels: {
  short: LocalizedText;
  strong: LocalizedText;
  deep?: LocalizedText;
  seconds?: Partial<Record<AnswerLevel['id'], number>>;
}): Draft => {
  const built: AnswerLevel[] = [
    { id: 'short', approxSeconds: levels.seconds?.short ?? 30, body: levels.short },
    { id: 'strong', approxSeconds: levels.seconds?.strong ?? 105, body: levels.strong },
  ];
  if (levels.deep) {
    built.push({ id: 'deep', approxSeconds: levels.seconds?.deep ?? 240, body: levels.deep });
  }
  return { kind: 'answer-levels', phase: 'answer', levels: built };
};

export const expected = (output: string, note?: LocalizedText): Draft => ({
  kind: 'expected-output',
  phase: 'answer',
  output: output.trim(),
  ...(note ? { note } : {}),
});

export const explain = (text: LocalizedText, heading?: LocalizedText): Draft => ({
  kind: 'text',
  phase: 'answer',
  text,
  ...(heading ? { heading } : {}),
});

export const lookingFor = (
  points: LocalizedList,
  signals?: { strong?: LocalizedText; shallow?: LocalizedText },
): Draft => ({
  kind: 'looking-for',
  phase: 'answer',
  points,
  ...(signals?.strong ? { strongSignal: signals.strong } : {}),
  ...(signals?.shallow ? { shallowSignal: signals.shallow } : {}),
});

export const mistakes = (points: LocalizedList): Draft => ({
  kind: 'common-mistakes',
  phase: 'answer',
  points,
});

export const tip = (text: LocalizedText): Draft => ({
  kind: 'interview-tip',
  phase: 'answer',
  text,
});

export const warn = (text: LocalizedText): Draft => ({
  kind: 'warning',
  phase: 'answer',
  text,
});

export const tradeOff = (
  rows: Array<{ option: LocalizedText; pros: LocalizedList; cons: LocalizedList }>,
): Draft => ({ kind: 'trade-off', phase: 'answer', rows });

export const followUps = (questions: LocalizedList): Draft => ({
  kind: 'follow-up',
  phase: 'answer',
  questions,
});

export const compare = (
  left: LocalizedText,
  right: LocalizedText,
  rows: Array<{ aspect: LocalizedText; left: LocalizedText; right: LocalizedText }>,
  verdict?: LocalizedText,
): Draft => ({
  kind: 'compare',
  phase: 'answer',
  left,
  right,
  rows,
  ...(verdict ? { verdict } : {}),
});

export const diagram = (
  title: LocalizedText,
  nodes: Array<{ id: string; label: LocalizedText; col: number; row: number; tone?: 'neutral' | 'accent' | 'muted' | 'danger' }>,
  edges: Array<{ from: string; to: string; label?: LocalizedText; dashed?: boolean }>,
  caption?: LocalizedText,
): Draft => ({
  kind: 'diagram',
  phase: 'answer',
  title,
  nodes,
  edges,
  ...(caption ? { caption } : {}),
});

export const links = (items: Array<{ url: string; title: string; source: string }>): Draft => ({
  kind: 'link',
  phase: 'answer',
  links: items,
});

// --- content builder -------------------------------------------------------

export interface ContentInput {
  slug: string;
  type: ContentTypeId;
  /** The work this asks for. Derived from the blocks and type when omitted. */
  kind?: ActivityKind;
  /** Overrides how the user answers, when the kind's default is wrong here. */
  mode?: ResponseMode;
  title: LocalizedText;
  categoryId: string;
  stackIds?: string[];
  skillIds: string[];
  difficulty: DifficultyId;
  tags?: string[];
  languages?: Locale[];
  minutes?: number;
  trap?: boolean;
  /** Overridden for selection-based formats. */
  spoken?: boolean;
  related?: string[];
  blocks: Draft[];
}

const SPOKEN_KINDS: ActivityKind[] = ['interview', 'speaking', 'architecture'];

const SEED_DATE = '2026-01-15T09:00:00.000Z';

export function content(input: ContentInput): Content {
  const blocks = input.blocks.map((block, index) => ({
    ...block,
    id: `${input.slug}-b${index + 1}`,
  })) as Block[];

  return {
    id: input.slug,
    slug: input.slug,
    type: input.type,
    ...(input.kind ? { activityKind: input.kind } : {}),
    ...(input.mode ? { responseMode: input.mode } : {}),
    status: 'published',
    title: input.title,
    categoryId: input.categoryId,
    stackIds: input.stackIds ?? [],
    skillIds: input.skillIds,
    difficulty: input.difficulty,
    tags: input.tags ?? [],
    languages: input.languages ?? ['pt', 'en'],
    estimatedMinutes: input.minutes ?? 4,
    ...(input.trap ? { isTrap: true } : {}),
    // Kept for older items and for the practice generator's own reading of
    // "does this take a take"; the activity kind is what screens ask now.
    requiresSpokenAttempt:
      input.spoken ??
      (input.kind
        ? SPOKEN_KINDS.includes(input.kind)
        : !['multiple-choice', 'true-false'].includes(input.type)),
    blocks,
    relatedContentIds: input.related ?? [],
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
    version: 1,
  };
}
