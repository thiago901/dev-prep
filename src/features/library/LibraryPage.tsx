import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LuSearch, LuSlidersHorizontal, LuStar, LuTriangleAlert, LuX } from 'react-icons/lu';
import type { Content, Locale, SrsState } from '@/domain/types';
import { CATEGORIES, CONTENT_TYPES, DIFFICULTIES, STACKS } from '@/data/seed/taxonomy';
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filterContent,
  stateOf,
  type LibraryFilters,
} from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { StateLamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState, Tag } from '@/components/ui/States';

/**
 * The library.
 *
 * Every row carries the same fixed label strip in the same position — type,
 * stack, difficulty, time — so a dense list is scannable without reading a
 * single title. That is what makes 70 items browsable rather than a wall.
 */
export function LibraryPage() {
  const { ready, index, toggleFavorite } = useStudy();
  const { t, text } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  // A link from the home console arrives with a filter already applied.
  useEffect(() => {
    const category = searchParams.get('category');
    const skill = searchParams.get('skill');
    const stack = searchParams.get('stack');

    setFilters((previous) => ({
      ...previous,
      categoryIds: category ? [category] : previous.categoryIds,
      stackIds: stack ? [stack] : previous.stackIds,
      text: skill ? skill : previous.text,
    }));
  }, [searchParams]);

  const results = useMemo(() => filterContent(index, filters), [index, filters]);
  const activeCount = countActiveFilters(filters);

  const toggleIn = <K extends keyof LibraryFilters>(key: K, value: string) => {
    setFilters((previous) => {
      const current = previous[key] as unknown as string[];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      return { ...previous, [key]: next };
    });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setSearchParams({});
  };

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('library.title')}
        </h1>
        <span data-tabular className="legend-type shrink-0 tabular-nums">
          {t('library.results', { count: results.length, total: index.content.length })}
        </span>
      </div>

      {/* --- search and the filter toggle ---------------------------------- */}
      <div className="flex gap-2">
        <div className="recess flex min-w-0 flex-1 items-center gap-2.5 px-3">
          <LuSearch aria-hidden="true" className="shrink-0 text-legend-3" />
          <input
            type="search"
            value={filters.text}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, text: event.target.value }))
            }
            placeholder={t('library.search')}
            aria-label={t('library.searchLabel')}
            className="h-11 w-full min-w-0 bg-transparent text-body text-legend outline-none"
          />
          {filters.text ? (
            <button
              type="button"
              onClick={() => setFilters((previous) => ({ ...previous, text: '' }))}
              aria-label={t('action.clearFilters')}
              className="shrink-0 rounded-control p-1 text-legend-3 hover:text-legend"
            >
              <LuX aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <TransportButton
          variant={panelOpen || activeCount > 0 ? 'neutral' : 'quiet'}
          icon={<LuSlidersHorizontal />}
          onClick={() => setPanelOpen((previous) => !previous)}
          aria-expanded={panelOpen}
          aria-controls="library-filters"
        >
          {t('library.filters')}
          {activeCount > 0 ? (
            <span
              data-tabular
              className="ml-1.5 rounded-lamp bg-brass px-1.5 text-[0.6875rem] font-semibold tabular-nums text-[rgb(20,17,12)]"
            >
              {activeCount}
            </span>
          ) : null}
        </TransportButton>
      </div>

      {/* --- filters ------------------------------------------------------- */}
      {panelOpen ? (
        <Panel id="library-filters" className="overflow-hidden">
          <div className="space-y-5 p-4">
            <FilterGroup
              label={t('library.filters.category')}
              options={CATEGORIES.map((entry) => ({ value: entry.id, label: text(entry.label) }))}
              selected={filters.categoryIds}
              onToggle={(value) => toggleIn('categoryIds', value)}
            />
            <FilterGroup
              label={t('library.filters.stack')}
              options={STACKS.map((entry) => ({ value: entry.id, label: entry.label }))}
              selected={filters.stackIds}
              onToggle={(value) => toggleIn('stackIds', value)}
            />
            <FilterGroup
              label={t('library.filters.difficulty')}
              options={DIFFICULTIES.map((entry) => ({
                value: entry.id,
                label: text(entry.label),
              }))}
              selected={filters.difficulties}
              onToggle={(value) => toggleIn('difficulties', value)}
            />
            <FilterGroup
              label={t('library.filters.type')}
              options={CONTENT_TYPES.map((entry) => ({ value: entry.id, label: text(entry.label) }))}
              selected={filters.types}
              onToggle={(value) => toggleIn('types', value)}
            />
            <FilterGroup
              label={t('library.filters.state')}
              options={(['new', 'learning', 'review', 'mastered'] as SrsState[]).map((state) => ({
                value: state,
                label: t(`state.${state}`),
              }))}
              selected={filters.states}
              onToggle={(value) => toggleIn('states', value)}
            />
            <FilterGroup
              label={t('library.filters.language')}
              options={(['pt', 'en'] as Locale[]).map((code) => ({
                value: code,
                label: code.toUpperCase(),
              }))}
              selected={filters.locales}
              onToggle={(value) => toggleIn('locales', value)}
            />

            <div className="flex flex-wrap gap-2">
              <ToggleChip
                active={filters.favoritesOnly}
                onClick={() =>
                  setFilters((previous) => ({
                    ...previous,
                    favoritesOnly: !previous.favoritesOnly,
                  }))
                }
                icon={<LuStar />}
              >
                {t('library.filters.favorites')}
              </ToggleChip>
              <ToggleChip
                active={filters.trapsOnly}
                onClick={() =>
                  setFilters((previous) => ({ ...previous, trapsOnly: !previous.trapsOnly }))
                }
                icon={<LuTriangleAlert />}
              >
                {t('library.filters.traps')}
              </ToggleChip>
            </div>
          </div>

          {activeCount > 0 ? (
            <>
              <PanelRule />
              <div className="bg-felt px-4 py-3">
                <TransportButton variant="quiet" size="sm" onClick={clearAll}>
                  {t('action.clearFilters')}
                </TransportButton>
              </div>
            </>
          ) : null}
        </Panel>
      ) : null}

      {/* --- results ------------------------------------------------------- */}
      {results.length === 0 ? (
        <Panel>
          <EmptyState
            title={t('library.empty.title')}
            body={t('library.empty.body')}
            action={
              activeCount > 0 ? (
                <TransportButton variant="neutral" onClick={clearAll}>
                  {t('action.clearFilters')}
                </TransportButton>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <ul className="space-y-px overflow-hidden rounded-panel border border-rule">
          {results.map((item) => (
            <ContentRow
              key={item.id}
              content={item}
              state={stateOf(index, item.id)}
              isFavorite={index.favorites.has(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset>
      <Legend as="legend" className="mb-2.5">
        {label}
      </Legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <ToggleChip
            key={option.value}
            active={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </ToggleChip>
        ))}
      </div>
    </fieldset>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1.5 text-meta',
        'transition-all duration-150 ease-engage active:translate-y-px',
        active
          ? 'border-brass/50 bg-brass/[0.12] text-brass shadow-pressed'
          : 'border-rule-strong bg-plate text-legend-2 hover:border-legend-3 hover:text-legend',
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="text-[1.05em]">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

/** One row. The label strip is in the same place on every single one. */
function ContentRow({
  content,
  state,
  isFavorite,
  onToggleFavorite,
}: {
  content: Content;
  state: SrsState;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const { t, text } = useI18n();
  const typeDef = CONTENT_TYPES.find((entry) => entry.id === content.type);
  const stack = STACKS.find((entry) => entry.id === content.stackIds[0]);

  return (
    <li className="relative bg-chassis transition-colors duration-150 hover:bg-plate">
      <Link to={`/content/${content.slug}`} className="block px-4 py-3.5 pr-14">
        <div className="flex items-start gap-3">
          <span className="min-w-0 flex-1">
            <span className="block text-body font-medium text-legend">{text(content.title)}</span>

            {/* The fixed label strip: one silkscreened line, same order on every
                row. The state only prints when it says something — "new" on all
                74 rows is noise, not information. */}
            <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {state !== 'new' ? <StateLamp state={state} label={t(`state.${state}`)} /> : null}
              <span className="legend-type">
                {[
                  typeDef ? text(typeDef.label) : null,
                  stack?.label ?? null,
                  t(`difficulty.${content.difficulty}`),
                  t('content.minutes', { count: content.estimatedMinutes }),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
              {content.isTrap ? (
                <Tag tone="brass" className="inline-flex items-center gap-1">
                  <LuTriangleAlert aria-hidden="true" />
                  {t('content.trap')}
                </Tag>
              ) : null}
              {content.languages.length === 1 && content.languages[0] === 'en' ? (
                <Tag tone="channel2">EN</Tag>
              ) : null}
            </span>
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={onToggleFavorite}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? t('content.favorite.remove') : t('content.favorite.add')}
        className="absolute right-2 top-2.5 rounded-control p-2.5 text-legend-3 transition-colors hover:text-brass"
      >
        <LuStar aria-hidden="true" className={cn(isFavorite && 'fill-brass text-brass')} />
      </button>
    </li>
  );
}
