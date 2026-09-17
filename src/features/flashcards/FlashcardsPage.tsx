import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Confidence, Content } from '@/domain/types';
import { dueContent, recommendNext } from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState, Tag } from '@/components/ui/States';
import { Prose } from '@/features/content/blocks/Prose';

/**
 * Flashcards.
 *
 * The one place in the product where the answer is not gated behind a
 * recording, because this mode is for maintenance rather than rehearsal: a
 * quick pass over things already answered out loud at least once. The
 * confidence answer still feeds the same schedule.
 */
export function FlashcardsPage() {
  const { ready, index, grade } = useStudy();
  const { t, text } = useI18n();
  const navigate = useNavigate();

  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);

  const queue = useMemo(() => {
    const due = dueContent(index);
    if (due.length > 0) return due.slice(0, 20);
    // Nothing lapsed: offer the same ranked suggestions the console uses,
    // rather than an empty screen that gives the user nowhere to go.
    return recommendNext(index, { limit: 10 }).map((entry) => entry.content);
  }, [index]);

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  if (queue.length === 0) {
    return (
      <Panel className="mx-auto max-w-read">
        <EmptyState
          title={t('flashcards.empty.title')}
          body={t('flashcards.empty.body')}
          action={
            <TransportButton variant="primary" onClick={() => navigate('/library')}>
              {t('nav.library')}
            </TransportButton>
          }
        />
      </Panel>
    );
  }

  if (position >= queue.length) {
    return (
      <Panel className="mx-auto max-w-read">
        <EmptyState
          title={t('flashcards.done.title')}
          body={t('flashcards.done.body', { count: completed })}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <TransportButton
                variant="primary"
                onClick={() => {
                  setPosition(0);
                  setRevealed(false);
                  setCompleted(0);
                }}
              >
                {t('action.retry')}
              </TransportButton>
              <TransportButton variant="neutral" onClick={() => navigate('/')}>
                {t('nav.home')}
              </TransportButton>
            </div>
          }
        />
      </Panel>
    );
  }

  const card = queue[position];

  const answer = (confidence: Confidence) => {
    void grade(card.id, confidence, true);
    setCompleted((previous) => previous + 1);
    setPosition((previous) => previous + 1);
    setRevealed(false);
  };

  return (
    <div className="mx-auto max-w-[44rem] space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('flashcards.title')}
        </h1>
        <span data-tabular className="legend-type tabular-nums">
          {t('flashcards.progress', { current: position + 1, total: queue.length })}
        </span>
      </div>

      <p className="max-w-read text-body text-legend-3">{t('flashcards.subtitle')}</p>

      {/* A stable frame: the card never changes size when the answer appears. */}
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <Tag>{t(`difficulty.${card.difficulty}`)}</Tag>
          {card.stackIds[0] ? <Tag>{card.stackIds[0]}</Tag> : null}
          <button
            type="button"
            onClick={() => navigate(`/content/${card.slug}`)}
            className="legend-type ml-auto rounded-control px-2 py-1 text-legend-3 transition-colors hover:text-brass"
          >
            {t('attempt.record')}
          </button>
        </div>

        <PanelRule />

        <div className="min-h-[9rem] px-4 py-6">
          <p className="max-w-read text-prompt font-medium leading-snug text-legend">
            {text(card.title)}
          </p>
        </div>

        {revealed ? (
          <>
            <PanelRule />
            <div className="px-4 py-5">
              <Legend className="mb-3">{t('answer.short')}</Legend>
              <ShortAnswer card={card} />
            </div>

            <div className="grid gap-2 border-t border-rule bg-felt px-4 py-3 sm:grid-cols-3">
              {(
                [
                  { value: 'known', label: t('confidence.known'), tone: 'monitor' },
                  { value: 'partial', label: t('confidence.partial'), tone: 'brass' },
                  { value: 'unknown', label: t('confidence.unknown'), tone: 'record' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => answer(option.value)}
                  className="flex items-center justify-center gap-2 rounded-control border border-rule-strong bg-plate px-3 py-3 text-body text-legend-2 shadow-raised transition-all duration-150 ease-engage hover:border-legend-3 hover:text-legend active:translate-y-px active:shadow-pressed"
                >
                  <Lamp tone={option.tone} size="md" />
                  {option.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="border-t border-rule bg-felt px-4 py-3">
            <TransportButton variant="primary" size="lg" onClick={() => setRevealed(true)} fullWidth>
              {t('flashcards.show')}
            </TransportButton>
          </div>
        )}
      </Panel>
    </div>
  );
}

/** The short answer only. A flashcard that shows a deep dive is not a flashcard. */
function ShortAnswer({ card }: { card: Content }) {
  const { text } = useI18n();
  const { answerLocale } = useSettings();

  const levels = card.blocks.find((block) => block.kind === 'answer-levels');
  if (levels?.kind !== 'answer-levels') return null;

  const short = levels.levels.find((level) => level.id === 'short') ?? levels.levels[0];
  if (!short) return null;

  return <Prose text={text(short.body, answerLocale)} />;
}
