import { useCallback, useMemo, useState } from 'react';
import { LuLock, LuLockOpen, LuStar, LuTriangleAlert } from 'react-icons/lu';
import type { Attempt, Confidence, Content, Locale, ResponseMode } from '@/domain/types';
import { DIFFICULTIES, STACKS } from '@/data/seed/taxonomy';
import { activityKindOf, responseModeOf } from '@/domain/activity';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { Tag } from '@/components/ui/States';
import { BlockRenderer, type BlockContext } from './blocks';
import { RecordingDeck } from './RecordingDeck';
import { WrittenDeck } from './WrittenDeck';
import { ActivityChip, activityWhatKey } from './ActivityChip';
import type { RecordedTake } from '@/hooks/useRecorder';

/**
 * The content engine's screen.
 *
 * It renders whatever blocks the item declares, in the order it declares them,
 * split by the phase each block belongs to. The answer side does not exist in
 * the DOM until the gate opens — hiding it with CSS would put the answer one
 * inspector away, which for this product is the same as not withholding it.
 */

export interface ContentRendererProps {
  content: Content;
  attempts: Attempt[];
  answerLocale: Locale;
  isFavorite: boolean;
  maxRecordingMs: number;
  onToggleFavorite: () => void;
  onSaveTake: (take: RecordedTake, locale: Locale) => Promise<void>;
  onSilentAttempt: () => Promise<void>;
  onDeleteAttempt: (attemptId: string) => Promise<void>;
  onToggleStar: (attemptId: string) => Promise<void>;
  onGrade: (confidence: Confidence) => Promise<void>;
  onRevealWithoutAttempt: () => Promise<void>;
  getRecordingUrl: (recordingId: string) => Promise<string | null>;
  contentById: Map<string, Content>;
  onNavigate: (contentId: string) => void;
  /** Mock interview rounds withhold the answer entirely until the debrief. */
  answersSuppressed?: boolean;
  /**
   * Only attempts made at or after this moment open the gate. A practice
   * session sets it, so yesterday's take cannot unlock today's rep.
   */
  gateSince?: string;
  /** Which confidence answers to offer, in order. */
  confidenceChoices?: Confidence[];
  /** Keeps the user inside a session instead of offering ways out. */
  hideRelated?: boolean;
  onChoice?: (correct: boolean) => void;
  /** Fired when a selection activity finishes, with how many answers landed. */
  onResult?: (result: { right: number; total: number }) => void;
  onSaveWritten?: (answer: string) => Promise<void>;
  autoFocusRecord?: boolean;
}

export function ContentRenderer({
  content,
  attempts,
  answerLocale,
  isFavorite,
  maxRecordingMs,
  onToggleFavorite,
  onSaveTake,
  onSilentAttempt,
  onDeleteAttempt,
  onToggleStar,
  onGrade,
  onRevealWithoutAttempt,
  getRecordingUrl,
  contentById,
  onNavigate,
  answersSuppressed = false,
  gateSince,
  confidenceChoices = ['known', 'partial', 'unknown'],
  hideRelated = false,
  onChoice,
  onResult,
  onSaveWritten,
  autoFocusRecord = false,
}: ContentRendererProps) {
  const { t, text, isFallback } = useI18n();
  const [revealed, setRevealed] = useState(false);
  const [gradedAs, setGradedAs] = useState<Confidence | null>(null);
  /** Set when a selection activity has been answered on this screen. */
  const [answered, setAnswered] = useState(false);
  const [writingOpen, setWritingOpen] = useState(false);

  const kind = activityKindOf(content);
  const mode = responseModeOf(content);

  const hasAttempt = gateSince
    ? attempts.some((attempt) => attempt.createdAt >= gateSince)
    : attempts.length > 0;

  const promptBlocks = useMemo(
    () => content.blocks.filter((block) => block.phase === 'prompt'),
    [content.blocks],
  );
  const answerBlocks = useMemo(
    () => content.blocks.filter((block) => block.phase === 'answer'),
    [content.blocks],
  );
  const hasRelatedBlock = useMemo(
    () => content.blocks.some((block) => block.kind === 'related'),
    [content.blocks],
  );

  const handleResult = useCallback(
    (result: { right: number; total: number }) => {
      setAnswered(true);
      // The activity is over and the app already knows how it went: opening
      // the answer is the next thing the user wants, not another key to press.
      setRevealed(true);
      onResult?.(result);
    },
    [onResult],
  );

  const blockContext: BlockContext = useMemo(
    () => ({ answerLocale, contentById, onNavigate, onChoice, onResult: handleResult }),
    [answerLocale, contentById, onNavigate, onChoice, handleResult],
  );

  const difficulty = DIFFICULTIES.find((entry) => entry.id === content.difficulty);
  const stackLabels = content.stackIds
    .map((id) => STACKS.find((stack) => stack.id === id)?.label)
    .filter(Boolean);

  const revealWithoutAttempt = useCallback(async () => {
    await onRevealWithoutAttempt();
    setRevealed(true);
  }, [onRevealWithoutAttempt]);

  const grade = useCallback(
    async (confidence: Confidence) => {
      await onGrade(confidence);
      setGradedAs(confidence);
    },
    [onGrade],
  );

  const writtenAnswer = useMemo(() => {
    const relevant = attempts
      .filter((attempt) => attempt.writtenAnswer)
      .filter((attempt) => (gateSince ? attempt.createdAt >= gateSince : true));
    return relevant[relevant.length - 1]?.writtenAnswer ?? null;
  }, [attempts, gateSince]);

  const englishOnly = content.languages.length === 1 && content.languages[0] === 'en';

  return (
    <article className="space-y-6">
      {/* --- the fixed label strip, identical on every item ----------------- */}
      <header className="space-y-4">
        {/* The legend is never a kicker above the heading: the title leads,
            the favourite sits on its row, and the metadata follows it. */}
        <div className="flex items-start gap-3">
          <h1 className="min-w-0 flex-1 max-w-read text-deck font-semibold tracking-[-0.025em] text-legend">
            {text(content.title)}
          </h1>
          <TransportButton
            className="mt-1 shrink-0"
            variant="quiet"
            size="sm"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? t('content.favorite.remove') : t('content.favorite.add')}
            icon={<LuStar className={cn(isFavorite && 'fill-brass text-brass')} />}
          />
        </div>

        {/* One silkscreened line, the same order as every list row. The kind
            chip leads it: the work comes before the subject matter. */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <ActivityChip kind={kind} />
          <span className="legend-type leading-[1.5]">
            {[
              difficulty ? text(difficulty.label) : null,
              ...stackLabels,
              t('content.minutes', { count: content.estimatedMinutes }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          {content.isTrap ? (
            <Tag className="inline-flex items-center gap-1">
              <LuTriangleAlert aria-hidden="true" />
              {t('content.trap')}
            </Tag>
          ) : null}
        </div>

        <p className="max-w-read text-body text-legend-3">{t(activityWhatKey(kind))}</p>

        {englishOnly ? (
          <p className="inline-flex items-center gap-2 text-meta text-channel2">
            <Lamp tone="channel2" />
            {t('content.onlyEnglish')}
          </p>
        ) : null}

        {content.isTrap ? (
          <p className="max-w-read text-meta text-legend-3">{t('content.trap.explain')}</p>
        ) : null}
      </header>

      {/* --- the prompt side ------------------------------------------------ */}
      <div className="space-y-6">
        {/* A learn card has no gate: everything it has to say is the point. */}
        {(mode === 'read' ? content.blocks : promptBlocks).map((block) => (
          <BlockRenderer key={block.id} block={block} context={blockContext} />
        ))}
      </div>

      {/* --- channel one: how this activity is answered ---------------------- */}
      {mode === 'speak' ? (
        <div className="space-y-3">
          <RecordingDeck
            attempts={attempts}
            answerLocale={answerLocale}
            maxDurationMs={maxRecordingMs}
            onSaveTake={onSaveTake}
            onSilentAttempt={onSilentAttempt}
            onDeleteAttempt={onDeleteAttempt}
            onToggleStar={onToggleStar}
            getRecordingUrl={getRecordingUrl}
            compact={answersSuppressed}
            autoFocusRecord={autoFocusRecord}
          />

          {/* Writing is always an equal way through a spoken question: a quiet
              office should not end the session. */}
          {onSaveWritten && !writingOpen ? (
            <TransportButton variant="quiet" size="sm" onClick={() => setWritingOpen(true)}>
              {t('write.action')}
            </TransportButton>
          ) : null}
          {onSaveWritten && writingOpen ? (
            <WrittenDeck
              attempts={attempts}
              onSaveWritten={onSaveWritten}
              gateSince={gateSince}
              compact
            />
          ) : null}
        </div>
      ) : null}

      {mode === 'write' && onSaveWritten ? (
        <WrittenDeck
          attempts={attempts}
          onSaveWritten={onSaveWritten}
          onSilentAttempt={onSilentAttempt}
          gateSince={gateSince}
          compact={answersSuppressed}
        />
      ) : null}

      {/* --- channel two ---------------------------------------------------- */}
      {answersSuppressed ? (
        <Panel className="flex items-center gap-3 px-4 py-4" tone="recess">
          <LuLock aria-hidden="true" className="shrink-0 text-legend-3" />
          <p className="text-body text-legend-3">{t('mock.noAnswers')}</p>
        </Panel>
      ) : revealed ? (
        <>
          <div className="space-y-8">
            {/* Your answer stays on screen next to ours: comparing is the
                lesson, and a written answer that scrolls away teaches nothing. */}
            {writtenAnswer ? (
              <Panel className="overflow-hidden" role="status" aria-live="polite">
                <div className="px-4 py-3">
                  <Legend>{t('write.yours')}</Legend>
                </div>
                <PanelRule />
                <p className="max-w-read whitespace-pre-wrap bg-felt px-4 py-4 text-body leading-relaxed text-legend-2">
                  {writtenAnswer}
                </p>
              </Panel>
            ) : null}

            {answerBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} context={blockContext} />
            ))}

            {/* Related items live on the content itself rather than as a block,
                so every item gets a way onwards without an author remembering
                to add one. A content that declares its own related block wins. */}
            {!hideRelated && !hasRelatedBlock && content.relatedContentIds.length > 0 ? (
              <BlockRenderer
                block={{
                  id: `${content.id}-related`,
                  kind: 'related',
                  phase: 'answer',
                  contentIds: content.relatedContentIds,
                }}
                context={blockContext}
              />
            ) : null}
          </div>

          {/* Selection activities are graded by the app, which already knows
              what was right; learn cards are graded by their own footer. */}
          {hasAttempt && mode !== 'select' && mode !== 'read' ? (
            <ConfidencePanel gradedAs={gradedAs} onGrade={grade} choices={confidenceChoices} />
          ) : null}

          <div>
            <TransportButton variant="quiet" size="sm" onClick={() => setRevealed(false)}>
              {t('reveal.hide')}
            </TransportButton>
          </div>
        </>
      ) : mode === 'read' ? (
        <LearnFooter gradedAs={gradedAs} onGrade={grade} />
      ) : answerBlocks.length === 0 && mode === 'select' ? null : (
        <ChannelTwoLocked
          mode={mode}
          unlocked={hasAttempt || answered}
          onReveal={() => setRevealed(true)}
          onRevealAnyway={revealWithoutAttempt}
          hasFallbackLanguage={isFallback(content.title, answerLocale)}
        />
      )}
    </article>
  );
}

/**
 * Channel two while it is still inert.
 *
 * Struck through, cool, and explicitly locked. The escape hatch exists because
 * forcing someone with a broken microphone to record is worse — but it is
 * quiet, it says what it costs, and taking it does not advance the schedule.
 */
function ChannelTwoLocked({
  mode,
  unlocked,
  onReveal,
  onRevealAnyway,
  hasFallbackLanguage,
}: {
  /** Selection activities are gated by answering, not by recording. */
  mode: ResponseMode;
  unlocked: boolean;
  onReveal: () => void;
  onRevealAnyway: () => Promise<void>;
  hasFallbackLanguage: boolean;
}) {
  const { t } = useI18n();

  return (
    <Panel className={cn('overflow-hidden', !unlocked && 'border-dashed')}>
      <div className="flex items-center gap-3 px-4 py-4">
        <span
          aria-hidden="true"
          className={cn('shrink-0 text-[1.25rem]', unlocked ? 'text-brass' : 'text-channel2')}
        >
          {unlocked ? <LuLockOpen /> : <LuLock />}
        </span>
        <div className="min-w-0 flex-1">
          <Legend className={cn(!unlocked && 'text-channel2 line-through decoration-channel2/50')}>
            {mode === 'select' ? t('reveal.lockedSelect') : t('reveal.locked')}
          </Legend>
          {!unlocked ? (
            <p className="mt-1.5 max-w-read text-body text-legend-3">
              {mode === 'select'
                ? t('reveal.lockedSelectHelp')
                : mode === 'write'
                  ? t('reveal.lockedHelpWrite')
                  : t('reveal.lockedHelp')}
            </p>
          ) : null}
        </div>
      </div>

      <PanelRule />

      <div className="bg-felt px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Locked, but still legibly the control this panel is about. */}
          <TransportButton
            variant={unlocked ? 'primary' : 'neutral'}
            size="lg"
            disabled={!unlocked}
            icon={unlocked ? undefined : <LuLock />}
            className={cn(
              !unlocked &&
                'disabled:border-dashed disabled:border-rule-strong disabled:bg-transparent disabled:text-legend-3 disabled:opacity-100 disabled:shadow-none',
            )}
            onClick={onReveal}
          >
            {mode === 'select' ? t('reveal.actionSelect') : t('reveal.action')}
          </TransportButton>

          {hasFallbackLanguage ? (
            <span className="ml-auto legend-type text-channel2">{t('content.onlyEnglish')}</span>
          ) : null}
        </div>

        {/* The escape hatch is a footnote, not a peer of the reveal key: it
            exists for a broken microphone, and it says what it costs. */}
        {!unlocked && mode !== 'select' ? (
          <p className="mt-2.5 max-w-read text-micro leading-relaxed text-legend-3">
            <button
              type="button"
              onClick={onRevealAnyway}
              className="rounded-[2px] text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
            >
              {t('reveal.anyway')}
            </button>
            {' — '}
            {t('reveal.anyway.help')}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

/**
 * The confidence question.
 *
 * Asked against the user's own take rather than in the abstract: "did I say
 * that" is answerable, "how well do I know this" is not.
 */
function ConfidencePanel({
  gradedAs,
  onGrade,
  choices,
}: {
  gradedAs: Confidence | null;
  onGrade: (confidence: Confidence) => Promise<void>;
  choices: Confidence[];
}) {
  const { t } = useI18n();

  const all: Record<Confidence, { label: string; tone: 'monitor' | 'brass' | 'record' | 'channel2' }> = {
    unknown: { label: t('confidence.unknown'), tone: 'record' },
    partial: { label: t('confidence.partial'), tone: 'brass' },
    known: { label: t('confidence.known'), tone: 'monitor' },
    easy: { label: t('confidence.easy'), tone: 'channel2' },
  };
  const options = choices.map((value) => ({ value, ...all[value] }));

  return (
    <Panel className="overflow-hidden" aria-labelledby="confidence-heading">
      <div className="px-4 py-3">
        <Legend id="confidence-heading">{t('confidence.title')}</Legend>
        <p className="mt-1.5 text-meta text-legend-3">{t('confidence.help')}</p>
      </div>
      <PanelRule />
      <div
        className={cn(
          'grid gap-2 bg-felt px-4 py-3',
          options.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-3',
        )}
      >
        {options.map((option) => {
          const active = gradedAs === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onGrade(option.value)}
              aria-pressed={active}
              className={cn(
                'flex items-center justify-center gap-2 rounded-control border px-3 py-3',
                'text-body transition-all duration-150 ease-engage active:translate-y-px',
                active
                  ? 'border-legend-3 bg-plate text-legend shadow-pressed'
                  : 'border-rule-strong bg-plate text-legend-2 shadow-raised hover:border-legend-3 hover:text-legend',
              )}
            >
              <Lamp tone={option.tone} size="md" />
              {option.label}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

/**
 * The end of a learn card.
 *
 * A learn card is not graded on correctness — nothing was asked. It asks the
 * only question it can answer honestly: did this land? "Need another pass"
 * schedules it back sooner instead of pretending it was learned.
 */
function LearnFooter({
  gradedAs,
  onGrade,
}: {
  gradedAs: Confidence | null;
  onGrade: (confidence: Confidence) => Promise<void>;
}) {
  const { t } = useI18n();

  return (
    <Panel className="overflow-hidden">
      <div className="px-4 py-3">
        <Legend>{t('learn.check')}</Legend>
      </div>
      <PanelRule />
      <div className="flex flex-wrap gap-2 bg-felt px-4 py-3">
        <TransportButton
          variant={gradedAs === 'known' ? 'neutral' : 'primary'}
          size="lg"
          onClick={() => void onGrade('known')}
          aria-pressed={gradedAs === 'known'}
        >
          {t('learn.gotIt')}
        </TransportButton>
        <TransportButton
          variant="neutral"
          size="lg"
          onClick={() => void onGrade('partial')}
          aria-pressed={gradedAs === 'partial'}
        >
          {t('learn.again')}
        </TransportButton>
        {gradedAs ? (
          <span className="self-center legend-type text-monitor">{t('learn.marked')}</span>
        ) : null}
      </div>
    </Panel>
  );
}
