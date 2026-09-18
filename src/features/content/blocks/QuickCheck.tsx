import { useState } from 'react';
import { LuCircleCheck, LuCircleX } from 'react-icons/lu';
import type { QuickCheckBlock } from '@/domain/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { Prose, renderInline } from './Prose';

/**
 * Quick check — the second rung of the ladder.
 *
 * One statement at a time, yes or no, and every answer explained: a bare tick
 * teaches nothing, and someone who guessed right still needs the reason. The
 * block reports how many landed so the session can grade honestly.
 */
export function QuickCheck({
  block,
  answerLocale,
  onResult,
}: {
  block: QuickCheckBlock;
  answerLocale: import('@/domain/types').Locale;
  onResult?: (result: { right: number; total: number }) => void;
}) {
  const { t, text } = useI18n();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);

  const total = block.questions.length;
  const question = block.questions[index];
  const finished = index >= total;

  if (finished || !question) {
    return (
      <Panel className="overflow-hidden" aria-label={t('activity.quick-check')}>
        <div className="px-4 py-4">
          <Legend>{t('activity.quick-check')}</Legend>
          <p className="mt-1.5 text-body text-legend" data-tabular>
            {t('quick.score', { right, total })}
          </p>
        </div>
      </Panel>
    );
  }

  const answered = answer !== null;
  const correct = answered && answer === question.answer;

  const respond = (value: boolean) => {
    if (answered) return;
    setAnswer(value);
    if (value === question.answer) setRight((count) => count + 1);
  };

  const advance = () => {
    const next = index + 1;
    setIndex(next);
    setAnswer(null);
    // `right` already counted this answer: it was incremented when the user
    // pressed, one event earlier.
    if (next >= total) onResult?.({ right, total });
  };

  return (
    <Panel className="overflow-hidden" aria-label={t('activity.quick-check')}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Legend>{t('activity.quick-check')}</Legend>
        <span className="legend-type" data-tabular>
          {t('quick.progress', { done: index + 1, total })}
        </span>
      </div>
      <PanelRule />

      <div className="px-4 py-5">
        <p className="max-w-read text-prompt font-medium leading-snug text-legend">
          {renderInline(text(question.statement))}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[true, false].map((value) => {
            const chosen = answer === value;
            const isRight = value === question.answer;
            return (
              <button
                key={String(value)}
                type="button"
                onClick={() => respond(value)}
                disabled={answered}
                aria-pressed={chosen}
                className={cn(
                  'min-h-11 min-w-[7rem] flex-1 rounded-control border px-4 py-3 text-body',
                  'transition-all duration-150 ease-engage active:translate-y-px disabled:cursor-default',
                  !answered && 'border-rule-strong bg-plate text-legend-2 shadow-raised hover:border-legend-3 hover:text-legend',
                  answered && isRight && 'border-monitor/50 bg-monitor/[0.07] text-legend',
                  answered && !isRight && chosen && 'border-record/50 bg-record/[0.07] text-legend',
                  answered && !isRight && !chosen && 'border-rule bg-chassis text-legend-3',
                )}
              >
                {value ? t('quick.yes') : t('quick.no')}
              </button>
            );
          })}
        </div>
      </div>

      {answered ? (
        <>
          <PanelRule />
          <div className="bg-felt px-4 py-4" role="status" aria-live="polite">
            <p
              className={cn(
                'legend-type mb-2 inline-flex items-center gap-2',
                correct ? 'text-monitor' : 'text-record-ink',
              )}
            >
              <span aria-hidden="true">{correct ? <LuCircleCheck /> : <LuCircleX />}</span>
              {correct ? t('quick.right') : t('quick.wrong')}
              <span className="text-legend-3">
                {t('quick.answerWas', { answer: question.answer ? t('quick.yes') : t('quick.no') })}
              </span>
            </p>
            <Prose text={text(question.why, answerLocale)} />
            <TransportButton className="mt-4" variant="neutral" onClick={advance}>
              {index + 1 >= total ? t('action.finish') : t('action.next')}
            </TransportButton>
          </div>
        </>
      ) : null}
    </Panel>
  );
}
