import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A toggle chip: a filter or a preference, pressed or not.
 *
 * One component for every filter surface in the product, so a chip on the
 * practice desk and a chip on the speaking list are the same control with the
 * same touch target rather than two lookalikes.
 */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center rounded-control border px-2.5 py-1.5 text-meta',
        'transition-all duration-150 ease-engage active:translate-y-px',
        active
          ? 'border-brass/50 bg-brass/[0.12] text-brass shadow-pressed'
          : 'border-rule-strong bg-plate text-legend-2 hover:border-legend-3 hover:text-legend',
        className,
      )}
    >
      {children}
    </button>
  );
}
