import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { pathProgress, recommendPath, type PathProgress } from '@/domain/paths';
import { activityKindOf } from '@/domain/activity';
import { LEARNING_PATHS } from '@/data/seed/paths';
import { CATEGORIES } from '@/data/seed/taxonomy';
import { stateOf } from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { PageSkeleton } from '@/components/ui/States';
import { SessionRail } from '@/features/practice/PracticeParts';
import { ActivityChip } from '@/features/content/ActivityChip';

/**
 * Learn.
 *
 * One question answered on this screen: what am I working through right now?
 * The path in progress is the first thing on it, the rest of the catalogue is
 * underneath, and browsing the whole bank is a door at the bottom rather than
 * a competing headline.
 */
export function LearnPage() {
  const { ready, index, snapshot } = useStudy();
  const { t, text } = useI18n();

  const paths = useMemo(
    () => LEARNING_PATHS.map((path) => pathProgress(path, index.byId, snapshot.progress)),
    [index.byId, snapshot.progress],
  );
  const featured = useMemo(() => recommendPath(paths), [paths]);
  const rest = useMemo(
    () => paths.filter((entry) => entry.path.id !== featured?.path.id),
    [paths, featured],
  );

  if (!ready) return <PageSkeleton label={t('common.loading')} rows={3} />;

  return (
    <div className="mx-auto max-w-[60rem] space-y-6">
      <div className="space-y-2">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('learn.title')}
        </h1>
        <p className="max-w-read text-body text-legend-3">{t('learn.subtitle')}</p>
      </div>

      {featured ? <FeaturedPath progress={featured} /> : null}

      <Panel className="overflow-hidden" aria-labelledby="paths-heading">
        <PanelHeader legend={t('learn.paths')} headingId="paths-heading" />
        <PanelRule />
        <ul>
          {/* The featured path is already the panel above; repeating it as a
              row makes the same thing look like two choices. */}
          {rest.map((entry) => (
            <li key={entry.path.id}>
              <Link
                to={`/learn/${entry.path.slug}`}
                className="group flex items-center gap-4 border-t border-rule/60 px-4 py-4 transition-colors duration-150 first:border-t-0 hover:bg-plate"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-body-lg font-medium text-legend">
                    {text(entry.path.title)}
                  </span>
                  <span className="mt-1 block max-w-read text-meta text-legend-3">
                    {text(entry.path.summary)}
                  </span>
                  <span className="mt-2.5 flex items-center gap-3">
                    <SessionRail
                      className="w-24"
                      label={text(entry.path.title)}
                      items={entry.steps.map((step) => ({
                        status: step.done ? 'done' : 'pending',
                      }))}
                    />
                    <span className="legend-type" data-tabular>
                      {entry.complete
                        ? t('path.done')
                        : t('path.stepOf', { current: entry.position, total: entry.total })}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-legend-3 transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  <LuArrowRight />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="overflow-hidden" aria-labelledby="explore-heading">
        <PanelHeader legend={t('learn.explore')} headingId="explore-heading" />
        <PanelRule />
        {/* A selector list, the same one Home uses. Subjects are not tiles. */}
        <ul>
          {CATEGORIES.map((category) => {
            const items = index.content.filter((item) => item.categoryId === category.id);
            if (items.length === 0) return null;
            const practised = items.some((item) => stateOf(index, item.id) !== 'new');
            return (
              <li key={category.id}>
                <Link
                  to={`/library?category=${category.id}`}
                  className="group flex items-center gap-3 border-t border-rule/60 px-4 py-2.5 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                >
                  <Lamp tone={practised ? 'monitor' : 'off'} />
                  <span className="shrink-0 text-body text-legend">{text(category.label)}</span>
                  <span className="hidden min-w-0 flex-1 truncate text-meta text-legend-3 sm:block">
                    {text(category.blurb)}
                  </span>
                  <span
                    data-tabular
                    className="ml-auto shrink-0 font-mono text-meta tabular-nums text-legend-3"
                  >
                    {items.length}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

/** The path the user is actually in the middle of, with the next step named. */
function FeaturedPath({ progress }: { progress: PathProgress }) {
  const { t, text } = useI18n();
  const navigate = useNavigate();
  const next = progress.next;

  return (
    <Panel className="overflow-hidden" aria-labelledby="featured-path">
      <PanelHeader
        legend={progress.started ? t('learn.continueTitle') : t('home.learn.startTitle')}
        headingId="featured-path"
        actions={
          <span className="legend-type" data-tabular>
            {progress.complete
              ? t('path.done')
              : t('path.stepOf', { current: progress.position, total: progress.total })}
          </span>
        }
      />
      <SessionRail
        className="mx-4"
        label={text(progress.path.title)}
        items={progress.steps.map((step) => ({ status: step.done ? 'done' : 'pending' }))}
        position={progress.position - 1}
      />

      <div className="px-4 pb-5 pt-4">
        <h2 className="max-w-read text-prompt font-medium leading-snug text-legend">
          {text(progress.path.title)}
        </h2>
        <p className="mt-2 max-w-read text-body text-legend-3">{text(progress.path.summary)}</p>

        {next ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <ActivityChip kind={activityKindOf(next)} />
            <span className="text-body text-legend-2">{text(next.title)}</span>
          </div>
        ) : null}
      </div>

      <PanelRule />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-felt px-4 py-3">
        <TransportButton
          variant="primary"
          size="lg"
          onClick={() =>
            navigate(next ? `/content/${next.slug}` : `/learn/${progress.path.slug}`)
          }
        >
          {progress.complete
            ? t('path.restart')
            : progress.started
              ? t('action.continue')
              : t('path.start')}
        </TransportButton>
        <span className="legend-type" data-tabular>
          {t('path.remaining', { count: progress.minutesLeft })}
        </span>
        <Link
          to={`/learn/${progress.path.slug}`}
          className="ml-auto rounded-[2px] text-meta text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
        >
          {t('path.steps', { count: progress.total })}
        </Link>
      </div>
    </Panel>
  );
}

export { LearnPage as default };
