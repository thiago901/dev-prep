/**
 * The DevPrep content engine.
 *
 * Content -> Type -> Blocks -> Interaction -> Answer -> Evaluation
 *
 * Nothing in here knows about React. Screens render whatever blocks a content
 * item declares, which is what lets a new content format ship without editing
 * a single screen.
 */

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

export type Locale = 'pt' | 'en';

export const LOCALES: readonly Locale[] = ['pt', 'en'] as const;

/**
 * Text authored per language. Never a translation table: the English answer is
 * written the way a developer would actually say it, not converted from the
 * Portuguese one. A missing locale is a real, renderable state.
 */
export type LocalizedText = Partial<Record<Locale, string>>;

/** A list authored per language, used for bullet points and follow-ups. */
export type LocalizedList = Partial<Record<Locale, string[]>>;

// ---------------------------------------------------------------------------
// Taxonomy — all of it data, none of it enumerated inside a component
// ---------------------------------------------------------------------------

export type DifficultyId = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ContentTypeId =
  | 'interview-question'
  | 'code-reading'
  | 'explain-code'
  | 'find-the-bug'
  | 'debugging'
  | 'architecture'
  | 'system-design'
  | 'scenario'
  | 'behavioral'
  | 'concept'
  | 'multiple-choice'
  | 'true-false'
  | 'compare'
  | 'refactoring'
  | 'security';

/**
 * What the user is about to *do*, as opposed to what the item is about.
 *
 * `type` describes the material; `ActivityKind` describes the work. The two
 * are separate because the same subject is taught by reading it, checked by a
 * yes/no, argued by a decision and finally answered out loud — and the screen
 * has to name that work before the user commits to it.
 */
export type ActivityKind =
  | 'learn'
  | 'quick-check'
  | 'decision'
  | 'multiple-choice'
  | 'code-reading'
  | 'find-the-bug'
  | 'architecture'
  | 'interview'
  | 'speaking'
  | 'written'
  | 'challenge';

/**
 * How the user answers. This is the one switch that decides whether a
 * microphone is offered at all: recording is a tool for spoken practice, not
 * the toll booth in front of every piece of knowledge.
 */
export type ResponseMode = 'read' | 'select' | 'write' | 'speak';

export interface Category {
  id: string;
  label: LocalizedText;
  /** Short line shown when the category is the subject of a screen. */
  blurb: LocalizedText;
  order: number;
}

export interface Stack {
  id: string;
  label: string;
  categoryIds: string[];
}

export interface Difficulty {
  id: DifficultyId;
  label: LocalizedText;
  order: number;
}

export interface ContentTypeDef {
  id: ContentTypeId;
  label: LocalizedText;
  /** One line telling the user what this format asks of them. */
  instruction: LocalizedText;
  /** Whether the format expects a spoken attempt before revealing. */
  expectsSpokenAttempt: boolean;
}

/**
 * Skills are first-class entities with their own surface, not rows in a
 * progress chart. A code-reading item can raise `javascript`; a behavioural
 * one raises `communication`; every English attempt raises `english-speaking`.
 */
export interface Skill {
  id: string;
  label: LocalizedText;
  kind: 'technical' | 'behavioral' | 'communication';
  /** One honest line about what having this skill means in an interview. */
  meaning: LocalizedText;
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

/**
 * Which side of the attempt gate a block lives on.
 *
 * `prompt` blocks are everything the candidate is allowed to see before
 * speaking. `answer` blocks are sealed until the attempt gate opens. The
 * renderer enforces this; it is not a UI convention that a screen can forget.
 */
export type RevealPhase = 'prompt' | 'answer';

interface BaseBlock {
  id: string;
  phase: RevealPhase;
}

/** The question itself, set at reading scale. */
export interface PromptBlock extends BaseBlock {
  kind: 'prompt';
  text: LocalizedText;
  /** Optional framing, e.g. "You are on a call with the hiring manager." */
  setup?: LocalizedText;
}

export interface TextBlock extends BaseBlock {
  kind: 'text';
  text: LocalizedText;
  heading?: LocalizedText;
}

export interface CodeBlock extends BaseBlock {
  kind: 'code';
  language: string;
  code: string;
  caption?: LocalizedText;
  /** 1-indexed lines to mark, used by find-the-bug and refactoring items. */
  highlightLines?: number[];
  filename?: string;
}

export interface ExpectedOutputBlock extends BaseBlock {
  kind: 'expected-output';
  output: string;
  note?: LocalizedText;
}

export type AnswerLevelId = 'short' | 'strong' | 'deep';

export interface AnswerLevel {
  id: AnswerLevelId;
  /** Roughly how long this version takes to say out loud. */
  approxSeconds: number;
  body: LocalizedText;
}

/**
 * The three depths of the same answer. Teaching a candidate that a good
 * interview answer is not "everything I know" is half the product.
 */
export interface AnswerLevelsBlock extends BaseBlock {
  kind: 'answer-levels';
  levels: AnswerLevel[];
}

export interface LookingForBlock extends BaseBlock {
  kind: 'looking-for';
  points: LocalizedList;
  /** What separates a passing answer from a strong one. */
  strongSignal?: LocalizedText;
  shallowSignal?: LocalizedText;
}

export interface CommonMistakesBlock extends BaseBlock {
  kind: 'common-mistakes';
  points: LocalizedList;
}

export interface TradeOffBlock extends BaseBlock {
  kind: 'trade-off';
  rows: Array<{
    option: LocalizedText;
    pros: LocalizedList;
    cons: LocalizedList;
  }>;
}

export interface InterviewTipBlock extends BaseBlock {
  kind: 'interview-tip';
  text: LocalizedText;
}

export interface WarningBlock extends BaseBlock {
  kind: 'warning';
  text: LocalizedText;
}

export interface TipBlock extends BaseBlock {
  kind: 'tip';
  text: LocalizedText;
}

export interface ExampleBlock extends BaseBlock {
  kind: 'example';
  text: LocalizedText;
  heading?: LocalizedText;
}

export interface FollowUpBlock extends BaseBlock {
  kind: 'follow-up';
  questions: LocalizedList;
}

export interface RelatedBlock extends BaseBlock {
  kind: 'related';
  contentIds: string[];
}

/**
 * How good an option actually is.
 *
 * Engineering interviews are rarely right/wrong. `partial` is the important
 * one: something a competent developer would really say, that misses a
 * constraint or only holds in a narrower context.
 */
export type OptionQuality = 'incorrect' | 'partial' | 'ideal';

export interface ChoicesBlock extends BaseBlock {
  kind: 'choices';
  multiple: boolean;
  options: Array<{
    id: string;
    label: LocalizedText;
    correct: boolean;
    /** Defaults to `correct ? 'ideal' : 'incorrect'` when an author omits it. */
    quality?: OptionQuality;
    why: LocalizedText;
  }>;
}

/**
 * A short run of yes/no statements, asked right after the material.
 *
 * Every answer is explained, including the right ones: a bare tick teaches
 * nothing, and a user who guessed correctly still needs the reason.
 */
export interface QuickCheckBlock extends BaseBlock {
  kind: 'quick-check';
  questions: Array<{
    id: string;
    statement: LocalizedText;
    /** The true answer to the statement as written. */
    answer: boolean;
    why: LocalizedText;
  }>;
}

/**
 * Decisions, one card at a time — swipe or press.
 *
 * Each card is a sentence a real developer could say in a real review. No
 * strawmen: if the wrong call is obviously stupid, nothing was tested.
 */
export interface DecisionBlock extends BaseBlock {
  kind: 'decision';
  cards: Array<{
    id: string;
    statement: LocalizedText;
    /** What an experienced engineer would do, given the stated context. */
    expected: 'agree' | 'disagree';
    /** One line naming the call, shown before the reasoning. */
    verdict: LocalizedText;
    why: LocalizedText;
    /** When the other call is defensible. Omitted when it never is. */
    context?: LocalizedText;
    tradeOff?: LocalizedText;
  }>;
}

export interface CompareBlock extends BaseBlock {
  kind: 'compare';
  left: LocalizedText;
  right: LocalizedText;
  rows: Array<{
    aspect: LocalizedText;
    left: LocalizedText;
    right: LocalizedText;
  }>;
  verdict?: LocalizedText;
}

export interface VideoBlock extends BaseBlock {
  kind: 'video';
  provider: 'youtube';
  videoId: string;
  title: LocalizedText;
  startSeconds?: number;
}

export interface LinkBlock extends BaseBlock {
  kind: 'link';
  links: Array<{ url: string; title: string; source: string }>;
}

export interface ImageBlock extends BaseBlock {
  kind: 'image';
  src: string;
  alt: LocalizedText;
  caption?: LocalizedText;
}

/**
 * A declarative diagram. Authored as nodes and edges rather than as an image
 * so it renders in both themes, stays legible at phone width, and remains
 * readable by a screen reader.
 */
export interface DiagramBlock extends BaseBlock {
  kind: 'diagram';
  title: LocalizedText;
  nodes: Array<{
    id: string;
    label: LocalizedText;
    /** Column and row on a coarse grid; the renderer handles the geometry. */
    col: number;
    row: number;
    tone?: 'neutral' | 'accent' | 'muted' | 'danger';
  }>;
  edges: Array<{
    from: string;
    to: string;
    label?: LocalizedText;
    dashed?: boolean;
  }>;
  caption?: LocalizedText;
}

export type Block =
  | PromptBlock
  | TextBlock
  | CodeBlock
  | ExpectedOutputBlock
  | AnswerLevelsBlock
  | LookingForBlock
  | CommonMistakesBlock
  | TradeOffBlock
  | InterviewTipBlock
  | WarningBlock
  | TipBlock
  | ExampleBlock
  | FollowUpBlock
  | RelatedBlock
  | ChoicesBlock
  | QuickCheckBlock
  | DecisionBlock
  | CompareBlock
  | VideoBlock
  | LinkBlock
  | ImageBlock
  | DiagramBlock;

export type BlockKind = Block['kind'];

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface Content {
  id: string;
  slug: string;
  type: ContentTypeId;
  /**
   * The work this item asks for. Optional in the data: `activityKindOf`
   * derives it from the blocks and the type when an author leaves it out, so
   * the whole bank gained activity kinds without being rewritten.
   */
  activityKind?: ActivityKind;
  /** Overrides the response mode the activity kind would imply. */
  responseMode?: ResponseMode;
  status: 'draft' | 'published';

  title: LocalizedText;
  categoryId: string;
  stackIds: string[];
  skillIds: string[];
  difficulty: DifficultyId;
  tags: string[];
  /** Which languages this item is actually authored in. */
  languages: Locale[];

  estimatedMinutes: number;

  /**
   * Marks a question designed to catch a candidate who has memorised
   * definitions instead of understanding behaviour. Shown as a discreet flag
   * that never gives the answer away.
   */
  isTrap?: boolean;

  /**
   * Whether the attempt gate expects a spoken take. Multiple-choice and
   * true/false items answer by selection instead.
   */
  requiresSpokenAttempt: boolean;

  blocks: Block[];
  relatedContentIds: string[];
  followUpContentIds?: string[];
  /** Items worth meeting first. Used to order a path, never to lock a door. */
  prerequisiteIds?: string[];

  createdAt: string;
  updatedAt: string;
  version: number;
}

// ---------------------------------------------------------------------------
// Study state
// ---------------------------------------------------------------------------

export type SrsState = 'new' | 'learning' | 'review' | 'mastered';

/**
 * What the user reports after seeing the model answer. `easy` ("too easy")
 * is only offered in practice sessions, where it steers the next session.
 */
export type Confidence = 'unknown' | 'partial' | 'known' | 'easy';

export interface ContentProgress {
  contentId: string;
  srsState: SrsState;
  /** Scheduling interval in days. */
  intervalDays: number;
  /** Ease factor, SM-2 style, clamped to a sane band. */
  ease: number;
  dueAt: string | null;
  lastSeenAt: string | null;
  reps: number;
  lapses: number;
  attempts: number;
  spokenAttempts: number;
  silentAttempts: number;
  revealedCount: number;
  lastConfidence: Confidence | null;
  /** Total speaking time on this item, in milliseconds. */
  spokenMs: number;
}

export type AttemptMode = 'spoken' | 'silent' | 'selection' | 'written';

/**
 * A learning path: one subject, taught in order.
 *
 * The steps are ordinary content items — a path is an itinerary through the
 * bank, not a second kind of content. That is what keeps a step reusable in
 * Today's Practice without being authored twice.
 */
export interface LearningPath {
  id: string;
  slug: string;
  title: LocalizedText;
  /** One line: what you will be able to answer when you finish. */
  summary: LocalizedText;
  categoryId: string;
  stackIds: string[];
  difficulty: DifficultyId;
  /** Content ids, in teaching order. */
  stepIds: string[];
}

export interface Attempt {
  id: string;
  contentId: string;
  createdAt: string;
  mode: AttemptMode;
  /** The language the candidate answered in. */
  locale: Locale;
  durationMs: number;
  recordingId: string | null;
  confidence: Confidence | null;
  /** The typed answer, when the user answered in writing. */
  writtenAnswer?: string;
  revealed: boolean;
  /** Marked as the take worth keeping, the way a studio circles a take. */
  starred: boolean;
  /** Rough word count, derived locally from duration for now. */
  estimatedWords?: number;
}

export interface Recording {
  id: string;
  attemptId: string;
  contentId: string;
  createdAt: string;
  durationMs: number;
  mimeType: string;
  sizeBytes: number;
  locale: Locale;
  /** Set once the blob has been uploaded to Firebase Storage. */
  storagePath: string | null;
}

export interface SkillLevel {
  skillId: string;
  /** 0..1. Derived from mastery, not from how many items were opened. */
  level: number;
  contentSeen: number;
  contentMastered: number;
  dueCount: number;
  lastPracticedAt: string | null;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  contentIds: string[];
  /** Speaking time across the session. */
  spokenMs: number;
  source: 'library' | 'flashcards' | 'english' | 'mock' | 'recommended';
}

// ---------------------------------------------------------------------------
// Mock interview
// ---------------------------------------------------------------------------

export interface MockBlueprintSlot {
  /** Human label for the slot, e.g. "Behavioural opener". */
  label: LocalizedText;
  types: ContentTypeId[];
  categoryIds?: string[];
  locale?: Locale;
  difficulty?: DifficultyId[];
}

export interface MockBlueprint {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  slots: MockBlueprintSlot[];
}

export interface MockInterview {
  id: string;
  blueprintId: string;
  createdAt: string;
  completedAt: string | null;
  items: Array<{
    contentId: string;
    slotLabel: LocalizedText;
    attemptId: string | null;
    durationMs: number;
    skipped: boolean;
  }>;
}

export interface MockSummary {
  answered: number;
  skipped: number;
  totalMs: number;
  averageMs: number;
  longestContentId: string | null;
  shortestContentId: string | null;
  weakSkillIds: string[];
  reviewContentIds: string[];
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export type TargetRole =
  | 'backend'
  | 'frontend'
  | 'fullstack'
  | 'software-engineer'
  | 'tech-lead';

export type ExperienceLevel = 'mid' | 'senior' | 'staff';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  targetRole: TargetRole | null;
  level: ExperienceLevel | null;
  stackIds: string[];
  /** Languages the user intends to interview in. */
  interviewLocales: Locale[];
  /** One honest line: "Backend roles in the EU, interviewing in March." */
  goal: string;
  createdAt: string;
}

export interface UserSettings {
  /** UI chrome language. */
  locale: Locale;
  /** Language the model answers are shown in by default. */
  answerLocale: Locale;
  theme: 'dark' | 'light';
  /** Some sessions cannot be spoken aloud; this is a context, not a cheat. */
  defaultAttemptMode: 'spoken' | 'silent';
  dailyGoalMinutes: number;
  /** Keep recordings on this device only, never upload. */
  keepRecordingsLocal: boolean;
}

// ---------------------------------------------------------------------------
// Entitlements
// ---------------------------------------------------------------------------

export type Plan = 'free' | 'premium';

export interface Entitlements {
  plan: Plan;
  /** Stored recordings allowed. Free users keep their most recent takes. */
  maxStoredRecordings: number;
  /** Longest single take. */
  maxRecordingMs: number;
  mockInterviewsPerWeek: number;
  showAds: boolean;
  advancedAnalytics: boolean;
  aiEvaluation: boolean;
}

export interface Subscription {
  uid: string;
  plan: Plan;
  status: 'active' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
}
