import type { ReactNode } from 'react';
import {
  LuArrowLeftRight,
  LuBookOpen,
  LuBug,
  LuCode,
  LuFlame,
  LuMessagesSquare,
  LuMic,
  LuNetwork,
  LuPenLine,
  LuTarget,
} from 'react-icons/lu';
import type { ActivityKind, Content } from '@/domain/types';
import { activityKindDef, activityKindOf, responseModeOf } from '@/domain/activity';
import { cn } from '@/lib/utils';
import { useI18n, type StringKey } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';

/**
 * Naming the work.
 *
 * Every activity says what it is before it starts — the icon and the label are
 * the same in the list, on the card and in the runner, so "what am I about to
 * do?" is answered by looking rather than by clicking.
 */

export const ACTIVITY_ICONS: Record<ActivityKind, ReactNode> = {
  learn: <LuBookOpen />,
  decision: <LuArrowLeftRight />,
  'multiple-choice': <LuTarget />,
  'code-reading': <LuCode />,
  'find-the-bug': <LuBug />,
  architecture: <LuNetwork />,
  interview: <LuMessagesSquare />,
  speaking: <LuMic />,
  written: <LuPenLine />,
  challenge: <LuFlame />,
};

export function activityLabelKey(kind: ActivityKind): StringKey {
  return `activity.${kind}` as StringKey;
}

export function activityWhatKey(kind: ActivityKind): StringKey {
  return `activity.${kind}.what` as StringKey;
}

/**
 * Kinds whose name already is the answer mode. "Resposta escrita | escrever"
 * spends a whole token saying nothing.
 */
const MODE_IS_THE_NAME: ActivityKind[] = ['learn', 'written', 'speaking'];

/** The fixed identity strip for one activity kind. Inert: never a control. */
export function ActivityChip({
  kind,
  className,
  showLabel = true,
  showMode = true,
}: {
  kind: ActivityKind;
  className?: string;
  showLabel?: boolean;
  /** The answer mode half. Dropped only where the mode is already obvious. */
  showMode?: boolean;
}) {
  const { t } = useI18n();
  const mode = activityKindDef(kind).responseMode;
  const withMode = showMode && !MODE_IS_THE_NAME.includes(kind);

  return (
    <span
      className={cn(
        'legend-type inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-[3px] border border-rule px-1.5 py-0.5 text-legend-2',
        className,
      )}
    >
      <span aria-hidden="true" className="text-[1.05em]">
        {ACTIVITY_ICONS[kind]}
      </span>
      {showLabel ? t(activityLabelKey(kind)) : null}
      {withMode ? (
        <>
          <span aria-hidden="true" className="h-2.5 w-px bg-rule-strong" />
          <span className="text-legend-3">{t(`mode.${mode}` as StringKey)}</span>
        </>
      ) : null}
    </span>
  );
}

/** The rung this activity sits on, drawn as five cells of a level meter. */
export function LadderMeter({ level, className }: { level: number; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="legend-type" data-tabular>
        {t('briefing.rung', { level })}
      </span>
      <span aria-hidden="true" className="recess inline-flex h-2 w-12 items-stretch gap-px p-px">
        {[1, 2, 3, 4, 5].map((step) => (
          <span
            key={step}
            className={cn('flex-1', step <= level ? 'bg-legend-3' : 'bg-rule')}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * What happens when you press start.
 *
 * Shown before the activity itself, outside sessions. It is deliberately not a
 * tooltip: the kind, the subject, the length and the way you will answer are
 * all on screen before anything is committed to.
 */
export function ActivityBriefing({
  content,
  onStart,
  startLabel,
  children,
}: {
  content: Content;
  onStart: () => void;
  startLabel?: string;
  children?: ReactNode;
}) {
  const { t, text } = useI18n();
  const kind = activityKindOf(content);
  const def = activityKindDef(kind);
  const mode = responseModeOf(content);

  const howKey: StringKey =
    mode === 'speak'
      ? 'briefing.recording'
      : mode === 'write'
        ? 'briefing.writing'
        : mode === 'select'
          ? 'briefing.selection'
          : 'briefing.reading';

  return (
    <Panel className="mx-auto max-w-[36rem] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Legend>{t('briefing.heading')}</Legend>
        <LadderMeter level={def.level} />
      </div>
      <PanelRule />

      <div className="space-y-4 px-4 py-5">
        {/* The heading leads. The chip is metadata, and metadata follows. */}
        <h1 className="max-w-read text-deck font-semibold tracking-[-0.025em] text-legend">
          {text(content.title)}
        </h1>
        <ActivityChip kind={kind} />
        <p className="max-w-read text-body text-legend-2">{t(activityWhatKey(kind))}</p>
        <p className="max-w-read text-body text-legend-3">{t(howKey)}</p>
        <p className="legend-type" data-tabular>
          {t('content.minutes', { count: content.estimatedMinutes })}
        </p>
        {children}
      </div>

      <PanelRule />
      <div className="bg-felt px-4 py-3">
        <TransportButton variant="primary" size="lg" onClick={onStart}>
          {startLabel ?? t('briefing.start')}
        </TransportButton>
      </div>
    </Panel>
  );
}
