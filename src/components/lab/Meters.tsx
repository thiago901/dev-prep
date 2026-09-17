import { useMemo } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import { Lamp, type LampTone } from './Lamp';

/**
 * A horizontal level meter.
 *
 * Used for two different things that are genuinely the same object: the live
 * input level while recording, and a skill's mastery level. Both are "how much
 * signal is there", and giving them one component is what makes the product
 * feel like one instrument rather than a dashboard.
 */
export function LevelMeter({
  value,
  tone = 'brass',
  segments = 24,
  className,
  label,
}: {
  /** 0..1 */
  value: number;
  tone?: Exclude<LampTone, 'off'>;
  segments?: number;
  className?: string;
  /** Accessible description; the meter itself is decorative without it. */
  label?: string;
}) {
  const lit = Math.round(Math.max(0, Math.min(1, value)) * segments);

  const fill: Record<Exclude<LampTone, 'off'>, string> = {
    brass: 'bg-brass',
    monitor: 'bg-monitor',
    record: 'bg-record',
    channel2: 'bg-channel2',
  };

  return (
    <div
      className={cn('recess flex h-2.5 items-stretch gap-px overflow-hidden px-px py-px', className)}
      role={label ? 'meter' : 'presentation'}
      aria-label={label}
      aria-valuenow={label ? Math.round(value * 100) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
    >
      {Array.from({ length: segments }, (_, segment) => (
        <span
          key={segment}
          className={cn(
            'flex-1 transition-colors duration-100',
            segment < lit ? fill[tone] : 'bg-rule',
          )}
        />
      ))}
    </div>
  );
}

/**
 * A channel strip: one named line with its level and state.
 * Skills are rendered as these, which is why a skill is a first-class thing in
 * this product rather than a row in a bar chart.
 */
export function ChannelStrip({
  name,
  meaning,
  value,
  tone = 'brass',
  badge,
  lampTone,
  className,
  onClick,
  href,
  compact = false,
}: {
  /** One readout line plus the meter — for banks where most strips read zero. */
  compact?: boolean;
  name: string;
  meaning?: string;
  value: number;
  tone?: Exclude<LampTone, 'off'>;
  badge?: string;
  lampTone?: LampTone;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const percent = Math.round(value * 100);

  const readout = badge ? (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {lampTone ? <Lamp tone={lampTone} /> : null}
      <span className="legend-type">{badge}</span>
    </span>
  ) : (
    <span data-tabular className="shrink-0 font-mono text-meta tabular-nums text-legend-2">
      {percent}%
    </span>
  );

  const body = compact ? (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-meta font-medium text-legend-2">{name}</span>
        {readout}
      </div>
      <LevelMeter value={value} tone={tone} className="mt-1.5 h-2" label={`${name}: ${percent}%`} />
    </>
  ) : (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-body font-medium text-legend">{name}</span>
        <span
          data-tabular
          className="shrink-0 font-mono text-meta tabular-nums text-legend-2"
        >
          {percent}%
        </span>
      </div>
      <LevelMeter value={value} tone={tone} className="mt-2" label={`${name}: ${percent}%`} />
      {(meaning || badge) && (
        <div className="mt-2 flex items-center justify-between gap-3">
          {meaning ? (
            <span className="truncate text-meta text-legend-3">{meaning}</span>
          ) : (
            <span />
          )}
          {badge ? (
            <span className="inline-flex shrink-0 items-center gap-1.5">
              {lampTone ? <Lamp tone={lampTone} /> : null}
              <span className="legend-type">{badge}</span>
            </span>
          ) : null}
        </div>
      )}
    </>
  );

  const shared = cn(
    'block w-full rounded-control px-3 text-left transition-colors duration-150',
    compact ? 'py-2' : 'py-3',
    (onClick || href) && 'hover:bg-plate focus-visible:bg-plate',
    className,
  );

  if (href) {
    return (
      <a href={href} className={shared}>
        {body}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shared}>
        {body}
      </button>
    );
  }

  return <div className={shared}>{body}</div>;
}

/**
 * The waveform of a take.
 *
 * Drawn from the peak trail captured while recording, so it is the real signal
 * rather than a decorative squiggle. When a take has no trail — restored from
 * another device, for instance — it renders as a flat line rather than fake
 * data, which is the honest state.
 */
export function Waveform({
  peaks,
  live = false,
  progress,
  className,
  tone = 'brass',
}: {
  peaks: number[];
  /** Anchors the trail to the right edge while a take is rolling. */
  live?: boolean;
  /** 0..1 playback position; bars behind it read as played. */
  progress?: number;
  className?: string;
  tone?: Exclude<LampTone, 'off'>;
}) {
  const bars = useMemo(() => {
    const target = 96;
    if (peaks.length === 0) return Array.from({ length: target }, () => 0);
    if (live) return peaks.slice(-target);

    // Downsample by averaging so a long take keeps its shape instead of being
    // decimated into noise.
    const bucket = Math.max(1, Math.floor(peaks.length / target));
    const out: number[] = [];
    for (let i = 0; i < peaks.length; i += bucket) {
      const slice = peaks.slice(i, i + bucket);
      out.push(slice.reduce((sum, value) => sum + value, 0) / slice.length);
    }
    return out.slice(0, target);
  }, [peaks, live]);

  const fill: Record<Exclude<LampTone, 'off'>, string> = {
    brass: 'bg-brass',
    monitor: 'bg-monitor',
    record: 'bg-record',
    channel2: 'bg-channel2',
  };

  const playedIndex = progress === undefined ? -1 : Math.floor(progress * bars.length);

  return (
    <div
      aria-hidden="true"
      className={cn('flex h-10 items-center gap-[2px] overflow-hidden', className)}
    >
      {bars.map((peak, position) => {
        const height = Math.max(2, Math.round(peak * 100));
        const played = playedIndex >= 0 && position <= playedIndex;
        return (
          <span
            key={position}
            style={{ height: `${height}%` }}
            className={cn(
              'w-full min-w-[2px] rounded-[1px] transition-colors duration-150',
              played ? fill[tone] : progress === undefined ? fill[tone] : 'bg-rule-strong',
              progress === undefined && 'opacity-80',
            )}
          />
        );
      })}
    </div>
  );
}

/** A transport counter. Tabular, monospaced, and it never changes width. */
export function Counter({
  ms,
  tone = 'legend',
  className,
}: {
  ms: number;
  tone?: 'legend' | 'record' | 'muted';
  className?: string;
}) {
  const ink = {
    legend: 'text-legend',
    record: 'text-record-ink',
    muted: 'text-legend-3',
  }[tone];

  return (
    <span data-tabular className={cn('font-mono text-body tabular-nums', ink, className)}>
      {formatDuration(ms)}
    </span>
  );
}
