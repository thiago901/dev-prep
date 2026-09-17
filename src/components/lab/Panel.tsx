import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A faceplate: the machined panel a group of controls is silkscreened onto.
 * Everything in the product that groups information sits on one of these.
 */
export function Panel({
  children,
  className,
  as: Tag = 'section',
  tone = 'chassis',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** `recess` is for areas that sit into the panel rather than on it. */
  tone?: 'chassis' | 'recess';
} & Record<string, unknown>) {
  return (
    <Tag className={cn(tone === 'recess' ? 'recess' : 'faceplate', className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A silkscreened legend.
 *
 * This is the heading itself, set the way it is printed on a faceplate — not a
 * label floating above a heading. Rendering it as the real heading element
 * keeps the document outline honest.
 */
export function Legend({
  children,
  as: Tag = 'h2',
  lit = false,
  className,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  lit?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn('legend-type', lit && 'legend-type-lit', className)}>
      {children}
    </Tag>
  );
}

/** The engraved hairline that separates regions of a panel. */
export function PanelRule({ className }: { className?: string }) {
  return <div role="presentation" className={cn('h-px w-full bg-rule', className)} />;
}

/**
 * A panel header: legend on the left, controls on the right, hairline beneath.
 * Using one component for this is what keeps every panel in the product
 * aligned on the same baseline.
 */
export function PanelHeader({
  legend,
  headingId,
  actions,
  className,
}: {
  legend: ReactNode;
  headingId?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-4 py-3', className)}>
      <Legend id={headingId}>{legend}</Legend>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}
