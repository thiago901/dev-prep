import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Panel } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';

/**
 * Empty, loading and error states.
 *
 * Each one says what happened and what to do next. An empty state that only
 * says "no results" makes the user guess; these name the recovery.
 */

export function EmptyState({
  title,
  body,
  action,
  icon,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      {icon ? (
        <span className="mb-4 text-2xl text-legend-3" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className="text-body-lg font-medium text-legend">{title}</p>
      <p className="mt-2 max-w-[42ch] text-body text-legend-3">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  retryLabel,
  onRetry,
}: {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <Panel className="mx-auto my-12 max-w-read p-6 text-center">
      <p className="text-body-lg font-medium text-record-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[48ch] text-body text-legend-2">{body}</p>
      <TransportButton className="mt-5" variant="neutral" onClick={onRetry}>
        {retryLabel}
      </TransportButton>
    </Panel>
  );
}

/**
 * A loading placeholder.
 *
 * Shaped like the content it replaces rather than a generic spinner, so the
 * layout does not jump when the real thing arrives.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-plate', className)}
    />
  );
}

export function SkeletonLines({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }, (_, line) => (
        <Skeleton
          key={line}
          className={cn('h-3.5', line === count - 1 ? 'w-2/5' : line % 2 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

/** The whole-screen state while the booth is still coming up. */
export function BoothLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4"
    >
      <div className="flex items-end gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className="w-1.5 animate-lamp-roll rounded-[1px] bg-brass"
            style={{
              height: `${12 + (bar % 3) * 8}px`,
              animationDelay: `${bar * 110}ms`,
            }}
          />
        ))}
      </div>
      <span className="legend-type">{label}</span>
    </div>
  );
}

/** A small, non-interactive descriptor. Fixed position in every content row. */
export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brass' | 'record' | 'channel2' | 'monitor';
  className?: string;
}) {
  const tones = {
    neutral: 'text-legend-3 border-rule',
    brass: 'text-brass border-brass/35',
    record: 'text-record-ink border-record/35',
    channel2: 'text-channel2 border-channel2/35',
    monitor: 'text-monitor border-monitor/35',
  }[tone];

  return (
    <span
      className={cn(
        'legend-type inline-flex items-center rounded-[3px] border px-1.5 py-0.5',
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}
