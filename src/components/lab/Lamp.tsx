import type { SrsState } from '@/domain/types';
import { cn } from '@/lib/utils';

export type LampTone = 'off' | 'monitor' | 'brass' | 'record' | 'channel2';

/**
 * A legend lamp.
 *
 * Dark when there is nothing to say, lit in one of four colours when there is.
 * The colour carries meaning on its own, but every lamp in the product is
 * always paired with a text label — colour is never the only signal.
 */
export function Lamp({
  tone = 'off',
  rolling = false,
  size = 'sm',
  className,
}: {
  tone?: LampTone;
  /** Slow pulse, used only while a take is actually rolling. */
  rolling?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const fill: Record<LampTone, string> = {
    off: 'bg-rule-strong',
    monitor: 'bg-monitor',
    brass: 'bg-brass',
    record: 'bg-record',
    channel2: 'bg-channel2',
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 rounded-lamp ring-1 ring-inset ring-black/30',
        size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        fill[tone],
        rolling && 'animate-lamp-roll',
        className,
      )}
    />
  );
}

export const STATE_TONE: Record<SrsState, LampTone> = {
  new: 'off',
  learning: 'brass',
  review: 'channel2',
  mastered: 'monitor',
};

/** The study state of one item, as a lamp plus its word. */
export function StateLamp({
  state,
  label,
  className,
}: {
  state: SrsState;
  label: string;
  className?: string;
}) {
  const ink: Record<SrsState, string> = {
    new: 'text-legend-3',
    learning: 'text-brass',
    review: 'text-channel2',
    mastered: 'text-monitor',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Lamp tone={STATE_TONE[state]} />
      <span className={cn('legend-type', ink[state])}>{label}</span>
    </span>
  );
}
