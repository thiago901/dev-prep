import { cn } from '@/lib/utils';

/**
 * The DevPrep mark: two channel tracks on a faceplate.
 *
 * The upper channel carries signal; the lower one is still nearly empty. That
 * is the product in one shape — your take comes first, the model answer stays
 * silent until it does.
 */
export function Mark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className={cn('shrink-0', className)}
    >
      <rect
        x="2.5"
        y="2.5"
        width="59"
        height="59"
        rx="15"
        className="fill-chassis stroke-rule-strong"
        strokeWidth="2"
      />
      <rect x="13" y="24" width="38" height="7" rx="3.5" className="fill-booth" />
      <rect x="13" y="24" width="31" height="7" rx="3.5" className="fill-brass" />
      <rect x="13" y="38" width="38" height="7" rx="3.5" className="fill-booth" />
      <rect x="13" y="38" width="7" height="7" rx="3.5" className="fill-channel2" />
    </svg>
  );
}

export function Wordmark({
  className,
  showTagline = false,
  tagline,
}: {
  className?: string;
  showTagline?: boolean;
  tagline?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Mark />
      <span className="flex flex-col leading-none">
        <span
          className="text-body-lg font-semibold tracking-[-0.01em] text-legend"
          style={{ fontStretch: '108%' }}
        >
          DevPrep
        </span>
        {showTagline && tagline ? (
          <span className="mt-1 text-meta text-legend-3">{tagline}</span>
        ) : null}
      </span>
    </span>
  );
}
