import type { ReactNode } from 'react';
import type { Content } from '@/domain/types';
import {
  estimateSessionMinutes,
  explainPlan,
  type PracticeItem,
  type PracticeReason,
  type PracticeSize,
} from '@/domain/practice';
import { cn } from '@/lib/utils';
import { useI18n, type StringKey } from '@/i18n';
import { Lamp, type LampTone } from '@/components/lab/Lamp';

/**
 * Shared pieces of Today's Practice.
 *
 * The session rail is a segmented meter with one cell per activity. Cells
 * re-letter as the session moves; the frame never changes size, so progress is
 * read by position rather than by a number that jumps.
 */

export function sessionName(size: PracticeSize): StringKey {
  return `practice.size.${size}` as StringKey;
}

export function SessionRail({
  items,
  position,
  className,
  label,
}: {
  items: Array<Pick<PracticeItem, 'status'>>;
  /** Index of the activity on screen; omit on summaries. */
  position?: number;
  className?: string;
  label: string;
}) {
  const done = items.filter((item) => item.status !== 'pending').length;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={items.length}
      aria-valuenow={done}
      className={cn('recess flex h-2.5 items-stretch gap-px overflow-hidden p-px', className)}
    >
      {items.map((item, index) => (
        <span
          key={index}
          className={cn(
            'flex-1 transition-colors duration-200',
            item.status === 'done' && 'bg-brass',
            item.status === 'skipped' && 'bg-rule-strong',
            item.status === 'pending' && (index === position ? 'bg-legend-3' : 'bg-rule'),
          )}
        />
      ))}
    </div>
  );
}

/** "Why these activities?" — every number is counted from the plan itself. */
export function WhyTheseActivities({
  plan,
  className,
}: {
  plan: Array<{ content: Content; reason: PracticeReason }>;
  className?: string;
}) {
  const { t } = useI18n();
  const why = explainPlan(plan);

  const rows: Array<{ count: number; key: StringKey; tone: LampTone }> = [
    { count: why.review, key: 'practice.why.review', tone: 'brass' },
    { count: why.fresh, key: 'practice.why.fresh', tone: 'off' },
    { count: why.weak, key: 'practice.why.weak', tone: 'record' },
    { count: why.technical, key: 'practice.why.technical', tone: 'off' },
    { count: why.english, key: 'practice.why.english', tone: 'channel2' },
    { count: why.speaking, key: 'practice.why.speaking', tone: 'off' },
  ];

  return (
    <div className={className}>
      <p className="legend-type mb-2">{t('practice.why')}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {rows
          .filter((row) => row.count > 0 && row.count < plan.length)
          .map((row) => (
            <li key={row.key} className="inline-flex items-center gap-1.5 text-meta text-legend-2">
              <Lamp tone={row.tone} />
              <span data-tabular>{t(row.key, { count: row.count })}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export function PlanMeta({
  contents,
  size,
  children,
}: {
  contents: Content[];
  size: number;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <span data-tabular className="font-mono text-meta tabular-nums text-legend-2">
      {t('practice.meta', { count: size, minutes: estimateSessionMinutes(contents) })}
      {children}
    </span>
  );
}
