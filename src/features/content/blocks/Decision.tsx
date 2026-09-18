import { useRef, useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuCircleCheck, LuCircleX } from 'react-icons/lu';
import type { DecisionBlock, DecisionInteractionMode, Locale } from '@/domain/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { Prose, renderInline } from './Prose';

/**
 * Decisions — one activity, three ways of pressing it.
 *
 * True/false, yes/no, agree/disagree and swipe are the same work: read a
 * statement a developer could really make, take a side, and be told what the
 * side costs. Only `interactionMode` differs, so the same authored card can
 * ship as a swipe deck on a phone and as two keys anywhere else.
 *
 * Dragging is never the only way through: the two keys do exactly the same
 * thing, which is what keeps this usable by keyboard and by screen reader.
 */

const COMMIT_PX = 72;

export function Decision({
  block,
  answerLocale,
  onResult,
}: {
  block: DecisionBlock;
  answerLocale: Locale;
  onResult?: (result: { right: number; total: number }) => void;
}) {
  const { t, text } = useI18n();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<'agree' | 'disagree' | null>(null);
  const [right, setRight] = useState(0);
  const [drag, setDrag] = useState(0);
  const pointerStart = useRef<number | null>(null);

  const mode: DecisionInteractionMode = block.interactionMode ?? 'swipe';
  const draggable = mode === 'swipe';

  // Binary items are statements about the world: true or false. Swipe and
  // button decks are about what you would do.
  const agreeLabel = block.labels?.agree
    ? text(block.labels.agree)
    : mode === 'binary'
      ? t('decision.true')
      : t('decision.agree');
  const disagreeLabel = block.labels?.disagree
    ? text(block.labels.disagree)
    : mode === 'binary'
      ? t('decision.false')
      : t('decision.disagree');

  const total = block.cards.length;
  const card = block.cards[index];

  if (!card) {
    return (
      <Panel className="px-4 py-4" aria-label={t('activity.decision')}>
        <Legend>{t('activity.decision')}</Legend>
        <p className="mt-1.5 text-body text-legend" data-tabular>
          {t('quick.score', { right, total })}
        </p>
      </Panel>
    );
  }

  const decided = choice !== null;
  const matched = decided && choice === card.expected;

  const decide = (value: 'agree' | 'disagree') => {
    if (decided) return;
    setDrag(0);
    setChoice(value);
    if (value === card.expected) setRight((count) => count + 1);
  };

  const advance = () => {
    const next = index + 1;
    setIndex(next);
    setChoice(null);
    setDrag(0);
    if (next >= total) onResult?.({ right, total });
  };

  // --- dragging: enhancement only, never the only way through ---------------
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (decided || !draggable) return;
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    setDrag(event.clientX - pointerStart.current);
  };
  const onPointerUp = () => {
    if (pointerStart.current === null) return;
    const travelled = drag;
    pointerStart.current = null;
    if (travelled > COMMIT_PX) decide('agree');
    else if (travelled < -COMMIT_PX) decide('disagree');
    else setDrag(0);
  };

  const leaning = Math.abs(drag) > COMMIT_PX / 2 ? (drag > 0 ? 'agree' : 'disagree') : null;

  return (
    <Panel className="overflow-hidden" aria-label={t('activity.decision')}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Legend>{t('activity.decision')}</Legend>
        <span className="legend-type" data-tabular>
          {t('decision.card', { current: index + 1, total })}
        </span>
      </div>
      <PanelRule />

      <div className="px-4 py-5">
        <div className="relative">
          {/* The two sides of the table, lit only by the direction of travel. */}
          {draggable ? (
            <>
              <span
                aria-hidden="true"
                className={cn(
                  'legend-type absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-150',
                  leaning === 'disagree' ? 'text-record-ink opacity-100' : 'opacity-0',
                )}
              >
                {disagreeLabel}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'legend-type absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-150',
                  leaning === 'agree' ? 'text-monitor opacity-100' : 'opacity-0',
                )}
              >
                {agreeLabel}
              </span>
            </>
          ) : null}

          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={drag ? { transform: `translateX(${drag}px) rotate(${drag / 40}deg)` } : undefined}
            className={cn(
              'recess select-none px-4 py-5 sm:px-5',
              draggable && !decided && 'cursor-grab touch-pan-y active:cursor-grabbing',
              !drag && 'transition-transform duration-200 ease-engage',
            )}
          >
            <p className="max-w-read text-prompt font-medium leading-snug text-legend">
              {renderInline(text(card.statement))}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <TransportButton
            className="min-h-11 flex-1"
            variant="neutral"
            icon={draggable ? <LuArrowLeft /> : undefined}
            disabled={decided}
            onClick={() => decide('disagree')}
          >
            {disagreeLabel}
          </TransportButton>
          <TransportButton
            className={cn('min-h-11 flex-1', draggable && 'flex-row-reverse')}
            variant="neutral"
            icon={draggable ? <LuArrowRight /> : undefined}
            disabled={decided}
            onClick={() => decide('agree')}
          >
            {agreeLabel}
          </TransportButton>
        </div>
        {!decided && draggable ? (
          <p className="mt-2.5 text-micro text-legend-3">{t('decision.help')}</p>
        ) : null}
      </div>

      {decided ? (
        <>
          <PanelRule />
          <div className="space-y-4 bg-felt px-4 py-4" role="status" aria-live="polite">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <span className="legend-type">
                {t('decision.yours')}{' '}
                <span className="text-legend">
                  {choice === 'agree' ? agreeLabel : disagreeLabel}
                </span>
              </span>
              <span className="legend-type">
                {t('decision.expected')}{' '}
                <span className="text-legend">
                  {card.expected === 'agree' ? agreeLabel : disagreeLabel}
                </span>
              </span>
              <span
                className={cn(
                  'legend-type inline-flex items-center gap-1.5',
                  matched ? 'text-monitor' : 'text-record-ink',
                )}
              >
                <span aria-hidden="true">{matched ? <LuCircleCheck /> : <LuCircleX />}</span>
                {matched ? t('decision.match') : t('decision.differ')}
              </span>
            </div>

            <p className="max-w-read text-body font-medium text-legend">
              {renderInline(text(card.verdict))}
            </p>
            <Prose text={text(card.why, answerLocale)} />

            {card.context ? (
              <div>
                <Legend as="p" className="mb-1.5">
                  {t('decision.context')}
                </Legend>
                <Prose text={text(card.context, answerLocale)} />
              </div>
            ) : null}

            {card.tradeOff ? (
              <div>
                <Legend as="p" className="mb-1.5">
                  {t('decision.tradeOff')}
                </Legend>
                <Prose text={text(card.tradeOff, answerLocale)} />
              </div>
            ) : null}

            <TransportButton variant="neutral" onClick={advance}>
              {index + 1 >= total ? t('action.finish') : t('action.next')}
            </TransportButton>
          </div>
        </>
      ) : null}
    </Panel>
  );
}
