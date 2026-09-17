import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Transport controls.
 *
 * These carry real mechanical travel: pressing displaces the key and swaps its
 * shadow from raised to inset. Affordance is carried by depth rather than by a
 * glow, and the active state sits *into* the panel instead of floating above
 * it. Every button in the product is one of these, so a control never arrives
 * as a stock component inside the committed form.
 */

export type TransportVariant = 'record' | 'primary' | 'neutral' | 'quiet' | 'danger';

const VARIANTS: Record<TransportVariant, string> = {
  record:
    'bg-record text-white border-record hover:bg-record/90 shadow-raised active:shadow-pressed',
  primary:
    'bg-brass text-[rgb(20,17,12)] border-brass hover:bg-brass/90 shadow-raised active:shadow-pressed',
  neutral:
    'bg-plate text-legend border-rule-strong hover:bg-rule hover:border-legend-3 shadow-raised active:shadow-pressed',
  quiet:
    'bg-transparent text-legend-2 border-transparent hover:bg-plate hover:text-legend',
  danger:
    'bg-transparent text-record-ink border-record/40 hover:bg-record/10 hover:border-record',
};

export function TransportButton({
  children,
  onClick,
  variant = 'neutral',
  size = 'md',
  icon,
  disabled = false,
  type = 'button',
  className,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  title,
  fullWidth = false,
  ref,
}: {
  /** React 19 passes ref as a prop; used to move focus onto the next step. */
  ref?: React.Ref<HTMLButtonElement>;
  children?: ReactNode;
  onClick?: () => void;
  variant?: TransportVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  title?: string;
  fullWidth?: boolean;
}) {
  const sizes = {
    // Comfortably past the 44px touch target at md and lg: recording on a
    // phone has to be the easiest interaction in the product.
    sm: 'h-9 px-3 text-meta gap-1.5',
    md: 'h-11 px-4 text-body gap-2',
    lg: 'h-14 px-6 text-body-lg gap-2.5',
  }[size];

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-control border font-medium',
        'transition-[transform,background-color,border-color,box-shadow] duration-150 ease-engage',
        'active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0',
        sizes,
        VARIANTS[variant],
        fullWidth && 'w-full',
        className,
      )}
    >
      {icon ? <span className="shrink-0 text-[1.1em] leading-none">{icon}</span> : null}
      {children}
    </button>
  );
}

/** The fixed row a transport's controls live in. It never moves between states. */
export function TransportRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-t border-rule bg-felt px-4 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A two-position switch, the way a channel selector works on a deck. Used for
 * the language toggle, where a dropdown would be heavier than the choice.
 */
export function TwoPositionSwitch<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  optionClassName,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  /** Extra classes per position, e.g. a 44px touch target on touch-first screens. */
  optionClassName?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('recess inline-flex items-stretch gap-px p-px', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'legend-type rounded-[2px] px-2.5 py-1.5 transition-all duration-150 ease-engage',
              active
                ? 'bg-plate text-legend shadow-pressed'
                : 'text-legend-3 hover:text-legend-2',
              optionClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
