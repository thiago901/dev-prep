import { useMemo, useState } from 'react';
import { LuChevronDown, LuDownload, LuGripVertical } from 'react-icons/lu';
import type { Block, Content } from '@/domain/types';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { isFirebaseConfigured } from '@/data/firebase/env';
import { cn } from '@/lib/utils';
import { Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton, TwoPositionSwitch } from '@/components/lab/Transport';
import { BoothLoading, Tag } from '@/components/ui/States';
import { BlockRenderer } from '@/features/content/blocks';

/**
 * The content builder.
 *
 * Reading and authoring are two modes of one object: this is the same block
 * renderer the study screen uses, with the block list exposed beside it. The
 * structure is already the publishing format, so wiring the write path to
 * Firestore later means adding a save call, not a new screen.
 */
export function AdminPage() {
  const { ready, index } = useStudy();
  const { answerLocale } = useSettings();
  const { t, text } = useI18n();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'blocks' | 'preview'>('blocks');

  const selected = useMemo(
    () => index.content.find((item) => item.id === selectedId) ?? index.content[0] ?? null,
    [index.content, selectedId],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  const exportJson = () => {
    if (!selected) return;
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selected.slug}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('admin.title')}
        </h1>
        <p className="max-w-read text-body text-legend-3">{t('admin.subtitle')}</p>
      </div>

      {!isFirebaseConfigured ? (
        <Panel className="px-4 py-3" tone="recess">
          <p className="max-w-read text-meta leading-relaxed text-legend-3">{t('admin.readOnly')}</p>
        </Panel>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* --- the catalogue ------------------------------------------------ */}
        <Panel className="max-h-[32rem] overflow-y-auto lg:max-h-[calc(100dvh-14rem)]">
          <ul>
            {index.content.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'w-full border-b border-rule/50 px-3 py-2.5 text-left transition-colors duration-150',
                    selected?.id === item.id
                      ? 'bg-plate text-legend shadow-pressed'
                      : 'text-legend-2 hover:bg-chassis hover:text-legend',
                  )}
                >
                  <span className="block truncate text-meta">{text(item.title)}</span>
                  <span className="legend-type mt-1 block">{item.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {/* --- the editor --------------------------------------------------- */}
        {selected ? (
          <div className="min-w-0 space-y-4">
            <Panel className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <TwoPositionSwitch
                  label={t('admin.blocks')}
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'blocks' as const, label: t('admin.blocks') },
                    { value: 'preview' as const, label: t('admin.preview') },
                  ]}
                />
                <TransportButton
                  className="ml-auto"
                  variant="quiet"
                  size="sm"
                  icon={<LuDownload />}
                  onClick={exportJson}
                >
                  {t('admin.export')}
                </TransportButton>
              </div>

              <PanelRule />

              <div className="space-y-2 px-4 py-4">
                <p className="text-body-lg font-medium text-legend">{text(selected.title)}</p>
                <div className="flex flex-wrap gap-2">
                  <Tag>{selected.type}</Tag>
                  <Tag>{selected.categoryId}</Tag>
                  <Tag>{selected.difficulty}</Tag>
                  {selected.languages.map((code) => (
                    <Tag key={code} tone="channel2">
                      {code.toUpperCase()}
                    </Tag>
                  ))}
                  {selected.isTrap ? <Tag tone="brass">{t('content.trap')}</Tag> : null}
                </div>
              </div>
            </Panel>

            {mode === 'blocks' ? (
              <BlockList blocks={selected.blocks} content={selected} />
            ) : (
              <Panel className="space-y-8 px-4 py-5">
                {selected.blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    context={{
                      answerLocale,
                      contentById: index.byId,
                      onNavigate: (contentId) => setSelectedId(contentId),
                    }}
                  />
                ))}
              </Panel>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** The block list: the shape an administrator reorders and edits. */
function BlockList({ blocks, content }: { blocks: Block[]; content: Content }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Panel className="overflow-hidden">
      <ul>
        {blocks.map((block) => {
          const open = expanded === block.id;
          return (
            <li key={block.id} className="border-b border-rule/50 last:border-0">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : block.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-plate"
              >
                <LuGripVertical aria-hidden="true" className="shrink-0 text-legend-3" />
                <span className="legend-type w-[8.5rem] shrink-0">{block.kind}</span>
                <Tag tone={block.phase === 'answer' ? 'channel2' : 'brass'}>{block.phase}</Tag>
                <LuChevronDown
                  aria-hidden="true"
                  className={cn(
                    'ml-auto shrink-0 text-legend-3 transition-transform duration-150',
                    open && 'rotate-180',
                  )}
                />
              </button>

              {open ? (
                <pre className="max-h-64 overflow-auto border-t border-rule bg-booth px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-legend-2">
                  {JSON.stringify(block, null, 2)}
                </pre>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="border-t border-rule bg-felt px-4 py-2.5">
        <span data-tabular className="legend-type tabular-nums">
          {blocks.length} · {content.slug}
        </span>
      </div>
    </Panel>
  );
}
