import { useState } from 'react';
import {
  LuArrowRight,
  LuCircleAlert,
  LuCircleCheck,
  LuCircleX,
  LuExternalLink,
  LuLightbulb,
  LuMessageSquareQuote,
  LuTerminal,
  LuTriangleAlert,
} from 'react-icons/lu';
import type {
  AnswerLevelId,
  Block,
  ChoicesBlock,
  CompareBlock,
  Content,
  DiagramBlock,
  Locale,
} from '@/domain/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { Legend, Panel } from '@/components/lab/Panel';
import { Tag } from '@/components/ui/States';
import { TwoPositionSwitch } from '@/components/lab/Transport';
import { CodeView } from './CodeView';
import { Prose, renderInline } from './Prose';

/**
 * Block components.
 *
 * The content decides which of these appear and in what order. Adding a new
 * content format means adding a block type and its component here — no screen
 * changes anywhere.
 */

export interface BlockContext {
  /** The language the reader wants answers in. */
  answerLocale: Locale;
  contentById: Map<string, Content>;
  onNavigate: (contentId: string) => void;
  /** Fired once when a selection-format item is answered. */
  onChoice?: (correct: boolean) => void;
}

/** A callout: one icon, one tone, one message. Used for tips and warnings. */
function Callout({
  tone,
  icon,
  label,
  children,
}: {
  tone: 'brass' | 'record' | 'channel2' | 'monitor';
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  const tones = {
    brass: 'border-brass/30 bg-brass/[0.06]',
    record: 'border-record/30 bg-record/[0.06]',
    channel2: 'border-channel2/30 bg-channel2/[0.06]',
    monitor: 'border-monitor/30 bg-monitor/[0.06]',
  }[tone];

  const ink = {
    brass: 'text-brass',
    record: 'text-record-ink',
    channel2: 'text-channel2',
    monitor: 'text-monitor',
  }[tone];

  return (
    <aside className={cn('rounded-panel border p-4', tones)}>
      <p className={cn('legend-type mb-2 flex items-center gap-1.5', ink)}>
        <span aria-hidden="true" className="text-[1.15em]">
          {icon}
        </span>
        {label}
      </p>
      {children}
    </aside>
  );
}

function BulletList({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'record' }) {
  return (
    <ul className="max-w-read space-y-2.5">
      {items.map((item, position) => (
        <li key={position} className="flex gap-2.5 text-body text-legend-2">
          <span
            aria-hidden="true"
            className={cn(
              'mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-lamp',
              tone === 'record' ? 'bg-record/70' : 'bg-brass/70',
            )}
          />
          <span>{renderInline(item)}</span>
        </li>
      ))}
    </ul>
  );
}

/** The three depths of the same answer, as switchable channels. */
function AnswerLevels({
  block,
  context,
}: {
  block: Extract<Block, { kind: 'answer-levels' }>;
  context: BlockContext;
}) {
  const { t, text } = useI18n();
  const [level, setLevel] = useState<AnswerLevelId>('short');

  const available = block.levels.filter((entry) => text(entry.body, context.answerLocale));
  const active = available.find((entry) => entry.id === level) ?? available[0];
  if (!active) return null;

  const labels: Record<AnswerLevelId, string> = {
    short: t('answer.short'),
    strong: t('answer.strong'),
    deep: t('answer.deep'),
  };

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <TwoPositionSwitch
          label={t('answer.short')}
          value={active.id}
          onChange={(next) => setLevel(next)}
          options={available.map((entry) => ({ value: entry.id, label: labels[entry.id] }))}
        />
        <span className="legend-type" data-tabular>
          {t('answer.seconds', { count: active.approxSeconds })}
        </span>
      </div>

      <div className="px-4 py-5">
        <Prose text={text(active.body, context.answerLocale)} size="lg" />
        <p className="mt-5 max-w-read border-t border-rule pt-3 text-meta text-legend-3">
          {t('answer.levelHelp')}
        </p>
      </div>
    </Panel>
  );
}

function Choices({ block, context }: { block: ChoicesBlock; context: BlockContext }) {
  const { t, text } = useI18n();
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Legend as="p">{t('block.choices.prompt')}</Legend>
      <ul className="space-y-2">
        {block.options.map((option) => {
          const isChosen = chosen === option.id;
          const revealed = chosen !== null;
          const correct = option.correct;

          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  setChosen(option.id);
                  context.onChoice?.(option.correct);
                }}
                disabled={revealed}
                aria-pressed={isChosen}
                className={cn(
                  'w-full rounded-panel border px-4 py-3 text-left transition-colors duration-150',
                  'disabled:cursor-default',
                  !revealed && 'border-rule bg-chassis hover:border-legend-3 hover:bg-plate',
                  revealed && correct && 'border-monitor/50 bg-monitor/[0.07]',
                  revealed && !correct && isChosen && 'border-record/50 bg-record/[0.07]',
                  revealed && !correct && !isChosen && 'border-rule bg-chassis opacity-60',
                )}
              >
                <span className="flex items-start gap-2.5">
                  {revealed ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 shrink-0 text-[1.1em]',
                        correct ? 'text-monitor' : 'text-record-ink',
                      )}
                    >
                      {correct ? <LuCircleCheck /> : <LuCircleX />}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-[0.35em] h-2.5 w-2.5 shrink-0 rounded-lamp border border-rule-strong"
                    />
                  )}
                  <span className="text-body text-legend">{renderInline(text(option.label))}</span>
                </span>

                {revealed ? (
                  <span className="mt-3 block border-t border-rule/60 pt-3">
                    <span
                      className={cn(
                        'legend-type mb-1.5 block',
                        correct ? 'text-monitor' : 'text-record-ink',
                      )}
                    >
                      {correct ? t('block.choices.correct') : t('block.choices.incorrect')}
                    </span>
                    <Prose text={text(option.why, context.answerLocale)} />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Compare({ block, context }: { block: CompareBlock; context: BlockContext }) {
  const { t, text } = useI18n();

  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-body">
          <caption className="sr-only">{t('block.compare')}</caption>
          <thead>
            <tr className="border-b border-rule bg-felt">
              <th scope="col" className="legend-type px-4 py-3 text-left">
                {t('block.aspect')}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-legend">
                {text(block.left)}
              </th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-legend">
                {text(block.right)}
              </th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, position) => (
              <tr key={position} className="border-b border-rule/60 last:border-0">
                <th scope="row" className="px-4 py-3 text-left align-top text-meta font-medium text-legend-3">
                  {text(row.aspect, context.answerLocale)}
                </th>
                <td className="px-4 py-3 align-top text-legend-2">
                  {text(row.left, context.answerLocale)}
                </td>
                <td className="px-4 py-3 align-top text-legend-2">
                  {text(row.right, context.answerLocale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {block.verdict ? (
        <div className="border-t border-rule bg-felt px-4 py-3">
          <Legend as="p" className="mb-1.5">
            {t('block.verdict')}
          </Legend>
          <p className="max-w-read text-body text-legend-2">
            {text(block.verdict, context.answerLocale)}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}

/**
 * A declarative diagram.
 *
 * Drawn from nodes and edges rather than shipped as an image, so it renders in
 * both themes and stays legible at phone width. The same data also produces
 * the list a screen reader gets, which an image never could.
 */
function Diagram({ block, context }: { block: DiagramBlock; context: BlockContext }) {
  const { text } = useI18n();

  const columns = Math.max(...block.nodes.map((node) => node.col)) + 1;
  const rows = Math.max(...block.nodes.map((node) => node.row)) + 1;

  const CELL_W = 168;
  const CELL_H = 86;
  const BOX_W = 140;
  const BOX_H = 48;
  const PAD = 14;

  const width = columns * CELL_W + PAD * 2;
  const height = rows * CELL_H + PAD * 2;

  const centre = (node: { col: number; row: number }) => ({
    x: PAD + node.col * CELL_W + CELL_W / 2,
    y: PAD + node.row * CELL_H + CELL_H / 2,
  });

  const byId = new Map(block.nodes.map((node) => [node.id, node]));

  const stroke: Record<NonNullable<DiagramBlock['nodes'][number]['tone']>, string> = {
    neutral: 'stroke-rule-strong fill-chassis',
    accent: 'stroke-brass/60 fill-brass/[0.08]',
    muted: 'stroke-rule fill-felt',
    danger: 'stroke-record/60 fill-record/[0.08]',
  };

  return (
    <figure className="space-y-3">
      <Legend as="figcaption">{text(block.title, context.answerLocale)}</Legend>

      <Panel className="overflow-x-auto p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[30rem]"
          role="img"
          aria-label={text(block.title, context.answerLocale)}
        >
          <defs>
            <marker
              id="devprep-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-legend-3" />
            </marker>
          </defs>

          {block.edges.map((edge, position) => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return null;

            const a = centre(from);
            const b = centre(to);

            // Stop the line at the box edge rather than at its centre.
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const horizontal = Math.abs(dx) > Math.abs(dy);
            const x1 = a.x + (horizontal ? Math.sign(dx) * (BOX_W / 2 + 4) : 0);
            const y1 = a.y + (horizontal ? 0 : Math.sign(dy) * (BOX_H / 2 + 4));
            const x2 = b.x - (horizontal ? Math.sign(dx) * (BOX_W / 2 + 8) : 0);
            const y2 = b.y - (horizontal ? 0 : Math.sign(dy) * (BOX_H / 2 + 8));

            return (
              <g key={position}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-rule-strong"
                  strokeWidth="1.5"
                  strokeDasharray={edge.dashed ? '4 4' : undefined}
                  markerEnd="url(#devprep-arrow)"
                />
                {edge.label ? (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    className="fill-legend-3 font-sans"
                    style={{ fontSize: 10, letterSpacing: '0.06em' }}
                  >
                    {text(edge.label, context.answerLocale)}
                  </text>
                ) : null}
              </g>
            );
          })}

          {block.nodes.map((node) => {
            const point = centre(node);
            return (
              <g key={node.id}>
                <rect
                  x={point.x - BOX_W / 2}
                  y={point.y - BOX_H / 2}
                  width={BOX_W}
                  height={BOX_H}
                  rx="4"
                  strokeWidth="1"
                  className={stroke[node.tone ?? 'neutral']}
                />
                <text
                  x={point.x}
                  y={point.y + 4}
                  textAnchor="middle"
                  className="fill-legend font-sans"
                  style={{ fontSize: 11.5 }}
                >
                  {text(node.label, context.answerLocale)}
                </text>
              </g>
            );
          })}
        </svg>
      </Panel>

      {block.caption ? (
        <p className="max-w-read text-meta text-legend-3">
          {text(block.caption, context.answerLocale)}
        </p>
      ) : null}
    </figure>
  );
}

function RelatedContent({
  contentIds,
  context,
}: {
  contentIds: string[];
  context: BlockContext;
}) {
  const { t, text } = useI18n();
  const items = contentIds
    .map((id) => context.contentById.get(id))
    .filter((item): item is Content => Boolean(item));

  if (items.length === 0) return null;

  return (
    <nav aria-labelledby="related-heading" className="space-y-3">
      <Legend id="related-heading">{t('block.related')}</Legend>
      <ul className="space-y-px overflow-hidden rounded-panel border border-rule">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => context.onNavigate(item.id)}
              className="group flex w-full items-center gap-3 bg-chassis px-4 py-3 text-left transition-colors duration-150 hover:bg-plate"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body text-legend">{text(item.title)}</span>
                <span className="legend-type mt-1 block">
                  {item.stackIds[0] ?? item.categoryId} · {t(`difficulty.${item.difficulty}`)}
                </span>
              </span>
              <LuArrowRight
                aria-hidden="true"
                className="shrink-0 text-legend-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brass"
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The registry.
 *
 * One switch, and it is the only place that knows the block vocabulary.
 */
export function BlockRenderer({ block, context }: { block: Block; context: BlockContext }) {
  const { t, text, list } = useI18n();

  switch (block.kind) {
    case 'prompt':
      return (
        <div className="space-y-3">
          {block.setup ? (
            <p className="max-w-read text-body text-legend-3">
              {text(block.setup, context.answerLocale)}
            </p>
          ) : null}
          <p className="max-w-read text-prompt font-medium text-legend sm:text-prompt-lg">
            {renderInline(text(block.text, context.answerLocale))}
          </p>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-2.5">
          {block.heading ? <Legend>{text(block.heading, context.answerLocale)}</Legend> : null}
          <Prose text={text(block.text, context.answerLocale)} />
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2.5">
          {block.caption ? (
            <p className="text-meta text-legend-3">{text(block.caption, context.answerLocale)}</p>
          ) : null}
          <CodeView
            code={block.code}
            language={block.language}
            filename={block.filename}
            highlightLines={block.highlightLines}
          />
        </div>
      );

    case 'expected-output':
      return (
        <div className="space-y-2.5">
          <Legend className="flex items-center gap-1.5">
            <LuTerminal aria-hidden="true" />
            {t('block.expectedOutput')}
          </Legend>
          <CodeView code={block.output} language="text" filename="output" />
          {block.note ? (
            <p className="max-w-read text-meta text-legend-3">
              {text(block.note, context.answerLocale)}
            </p>
          ) : null}
        </div>
      );

    case 'answer-levels':
      return <AnswerLevels block={block} context={context} />;

    case 'looking-for':
      return (
        <div className="space-y-3">
          <Legend lit>{t('block.lookingFor')}</Legend>
          <BulletList items={list(block.points, context.answerLocale)} />
          {block.strongSignal ? (
            <Callout tone="monitor" icon={<LuCircleCheck />} label={t('block.strongSignal')}>
              <Prose text={text(block.strongSignal, context.answerLocale)} />
            </Callout>
          ) : null}
          {block.shallowSignal ? (
            <Callout tone="channel2" icon={<LuCircleAlert />} label={t('block.shallowSignal')}>
              <Prose text={text(block.shallowSignal, context.answerLocale)} />
            </Callout>
          ) : null}
        </div>
      );

    case 'common-mistakes':
      return (
        <div className="space-y-3">
          <Legend>{t('block.mistakes')}</Legend>
          <BulletList items={list(block.points, context.answerLocale)} tone="record" />
        </div>
      );

    case 'trade-off':
      return (
        <div className="space-y-3">
          <Legend>{t('block.tradeOff')}</Legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {block.rows.map((row, position) => (
              <Panel key={position} className="p-4">
                <p className="mb-3 text-body font-semibold text-legend">
                  {text(row.option, context.answerLocale)}
                </p>
                <p className="legend-type mb-1.5 text-monitor">{t('block.pros')}</p>
                <BulletList items={list(row.pros, context.answerLocale)} />
                <p className="legend-type mb-1.5 mt-4 text-record-ink">{t('block.cons')}</p>
                <BulletList items={list(row.cons, context.answerLocale)} tone="record" />
              </Panel>
            ))}
          </div>
        </div>
      );

    case 'interview-tip':
      return (
        <Callout tone="brass" icon={<LuMessageSquareQuote />} label={t('block.interviewTip')}>
          <Prose text={text(block.text, context.answerLocale)} />
        </Callout>
      );

    case 'warning':
      return (
        <Callout tone="record" icon={<LuTriangleAlert />} label={t('block.warning')}>
          <Prose text={text(block.text, context.answerLocale)} />
        </Callout>
      );

    case 'tip':
      return (
        <Callout tone="monitor" icon={<LuLightbulb />} label={t('block.tip')}>
          <Prose text={text(block.text, context.answerLocale)} />
        </Callout>
      );

    case 'example':
      return (
        <div className="space-y-2.5">
          {block.heading ? <Legend>{text(block.heading, context.answerLocale)}</Legend> : null}
          <Prose text={text(block.text, context.answerLocale)} />
        </div>
      );

    case 'follow-up': {
      const questions = list(block.questions, context.answerLocale);
      if (questions.length === 0) return null;
      return (
        <div className="space-y-3">
          <Legend>{t('block.followUp')}</Legend>
          <p className="max-w-read text-meta text-legend-3">{t('block.followUp.help')}</p>
          <ol className="space-y-px overflow-hidden rounded-panel border border-rule">
            {questions.map((question, position) => (
              <li
                key={position}
                className="flex items-baseline gap-3 bg-chassis px-4 py-3 text-body text-legend-2"
              >
                <span data-tabular className="legend-type shrink-0 tabular-nums">
                  {String(position + 1).padStart(2, '0')}
                </span>
                <span>{renderInline(question)}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    }

    case 'related':
      return <RelatedContent contentIds={block.contentIds} context={context} />;

    case 'choices':
      return <Choices block={block} context={context} />;

    case 'compare':
      return <Compare block={block} context={context} />;

    case 'diagram':
      return <Diagram block={block} context={context} />;

    case 'video':
      return (
        <figure className="space-y-2.5">
          <Legend as="figcaption">{t('block.video')}</Legend>
          <div className="overflow-hidden rounded-panel border border-rule bg-booth">
            <iframe
              className="aspect-video w-full"
              src={`https://www.youtube-nocookie.com/embed/${block.videoId}${
                block.startSeconds ? `?start=${block.startSeconds}` : ''
              }`}
              title={text(block.title, context.answerLocale)}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </figure>
      );

    case 'link':
      return (
        <div className="space-y-3">
          <Legend>{t('block.links')}</Legend>
          <ul className="space-y-px overflow-hidden rounded-panel border border-rule">
            {block.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center gap-3 bg-chassis px-4 py-3 transition-colors duration-150 hover:bg-plate"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-legend">{link.title}</span>
                    <span className="legend-type mt-1 block">{link.source}</span>
                  </span>
                  <LuExternalLink aria-hidden="true" className="shrink-0 text-legend-3 group-hover:text-brass" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'image':
      return (
        <figure className="space-y-2.5">
          <img
            src={block.src}
            alt={text(block.alt, context.answerLocale)}
            loading="lazy"
            className="w-full rounded-panel border border-rule"
          />
          {block.caption ? (
            <figcaption className="max-w-read text-meta text-legend-3">
              {text(block.caption, context.answerLocale)}
            </figcaption>
          ) : null}
        </figure>
      );

    default:
      return null;
  }
}

export { Tag };
