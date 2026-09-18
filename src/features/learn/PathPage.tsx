import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LuArrowLeft, LuCheck } from 'react-icons/lu';
import { pathProgress } from '@/domain/paths';
import { activityKindOf } from '@/domain/activity';
import { LEARNING_PATH_BY_SLUG } from '@/data/seed/paths';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { EmptyState, PageSkeleton } from '@/components/ui/States';
import { SessionRail } from '@/features/practice/PracticeParts';
import { ActivityChip, activityWhatKey } from '@/features/content/ActivityChip';

/**
 * One path, laid out as the itinerary it is.
 *
 * Every step says what kind of work it is before it is opened, and the whole
 * ladder is visible at once: somebody arriving at the spoken question at the
 * end can see the four steps that got them there.
 */
export function PathPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, text } = useI18n();
  const { ready, index, snapshot } = useStudy();

  const path = slug ? LEARNING_PATH_BY_SLUG.get(slug) : undefined;
  const progress = useMemo(
    () => (path ? pathProgress(path, index.byId, snapshot.progress) : null),
    [path, index.byId, snapshot.progress],
  );

  if (!ready) return <PageSkeleton label={t('common.loading')} rows={2} />;

  if (!path || !progress) {
    return (
      <Panel className="mx-auto max-w-read">
        <EmptyState
          title={t('content.notFound.title')}
          body={t('path.empty')}
          action={
            <TransportButton variant="neutral" onClick={() => navigate('/learn')}>
              {t('nav.learn')}
            </TransportButton>
          }
        />
      </Panel>
    );
  }

  return (
    <div className="mx-auto max-w-[52rem] space-y-6">
      <TransportButton
        variant="quiet"
        size="sm"
        icon={<LuArrowLeft />}
        onClick={() => navigate('/learn')}
      >
        {t('nav.learn')}
      </TransportButton>

      <div className="space-y-3">
        <h1 className="max-w-read text-deck font-semibold tracking-[-0.025em] text-legend">
          {text(path.title)}
        </h1>
        <p className="max-w-read text-body text-legend-3">{text(path.summary)}</p>
        <p className="legend-type" data-tabular>
          {[
            t('path.steps', { count: progress.total }),
            progress.complete ? t('path.done') : t('path.remaining', { count: progress.minutesLeft }),
          ].join(' · ')}
        </p>
      </div>

      <SessionRail
        label={text(path.title)}
        items={progress.steps.map((step) => ({ status: step.done ? 'done' : 'pending' }))}
        position={progress.position - 1}
      />

      {/* The way in comes before the list of what is inside. */}
      {!progress.complete ? (
        <TransportButton
          variant="primary"
          size="lg"
          onClick={() => progress.next && navigate(`/content/${progress.next.slug}`)}
        >
          {progress.started ? t('action.continue') : t('path.start')}
        </TransportButton>
      ) : null}

      <Panel className="overflow-hidden" aria-labelledby="steps-heading">
        <PanelHeader
          legend={t('path.stepsLegend')}
          headingId="steps-heading"
          actions={
            <span className="legend-type" data-tabular>
              {t('path.stepOf', { current: progress.position, total: progress.total })}
            </span>
          }
        />
        <PanelRule />
        <ol>
          {progress.steps.map((step, position) => {
            const kind = activityKindOf(step.content);
            return (
              <li key={step.content.id}>
                <Link
                  to={`/content/${step.content.slug}`}
                  className={cn(
                    'group flex items-start gap-3.5 border-t border-rule/60 px-4 py-4 transition-colors duration-150 first:border-t-0 hover:bg-plate',
                    step.current && 'bg-felt',
                  )}
                >
                  <span
                    aria-hidden="true"
                    data-tabular
                    className={cn(
                      'mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lamp border text-micro',
                      step.done
                        ? 'border-brass/50 bg-brass/[0.12] text-brass'
                        : step.current
                          ? 'border-legend-3 text-legend'
                          : 'border-rule text-legend-3',
                    )}
                  >
                    {step.done ? <LuCheck /> : position + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-body-lg font-medium text-legend">
                      {text(step.content.title)}
                    </span>
                    <span className="mt-1 block text-meta text-legend-3">
                      {t(activityWhatKey(kind))}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <ActivityChip kind={kind} />
                      <span className="legend-type" data-tabular>
                        {t('content.minutes', { count: step.content.estimatedMinutes })}
                      </span>
                      {step.done ? (
                        <span className="legend-type text-brass">{t('path.stepDone')}</span>
                      ) : step.current ? (
                        <span className="legend-type text-legend-2">{t('path.current')}</span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Panel>

      {progress.complete ? (
        <Panel className="px-4 py-4">
          <p className="text-body-lg font-medium text-legend">{t('path.done')}</p>
          <p className="mt-1.5 max-w-read text-body text-legend-3">{t('path.doneBody')}</p>
          <TransportButton className="mt-4" variant="neutral" onClick={() => navigate('/learn')}>
            {t('nav.learn')}
          </TransportButton>
        </Panel>
      ) : null}
    </div>
  );
}

export { PathPage as default };
