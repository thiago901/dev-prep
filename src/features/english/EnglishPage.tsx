import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuSparkles } from 'react-icons/lu';
import { computeSkillLevels, stateOf } from '@/domain/selectors';
import { estimateWords, formatDuration, pacePerMinute } from '@/lib/utils';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { ChannelStrip, Counter } from '@/components/lab/Meters';
import { StateLamp } from '@/components/lab/Lamp';
import { BoothLoading, EmptyState } from '@/components/ui/States';

/**
 * Spoken English practice.
 *
 * The metrics here are deliberately modest and labelled as estimates. A
 * confident-looking fluency score derived from duration alone would be a lie,
 * and the architecture is ready for real evaluation without pretending to have
 * it now.
 */
export function EnglishPage() {
  const { ready, index } = useStudy();
  const { t, text } = useI18n();

  const englishContent = useMemo(
    () => index.content.filter((item) => item.categoryId === 'english'),
    [index.content],
  );

  const englishAttempts = useMemo(
    () =>
      index.attempts
        .filter((attempt) => attempt.locale === 'en' && attempt.mode === 'spoken')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [index.attempts],
  );

  const speakingLevel = useMemo(
    () => computeSkillLevels(index).find((level) => level.skillId === 'english-speaking'),
    [index],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  const latest = englishAttempts[0];
  const words = latest ? (latest.estimatedWords ?? estimateWords(latest.durationMs)) : 0;
  const pace = latest ? pacePerMinute(words, latest.durationMs) : 0;
  const paceLabel =
    pace === 0
      ? '—'
      : pace < 110
        ? t('english.metrics.pace.slow')
        : pace <= 160
          ? t('english.metrics.pace.natural')
          : t('english.metrics.pace.fast');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('english.title')}
        </h1>
        <p className="max-w-read text-body text-legend-3">{t('english.subtitle')}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Panel className="overflow-hidden" aria-labelledby="english-list">
          <div className="px-4 py-3">
            <Legend id="english-list">{t('english.title')}</Legend>
          </div>
          <PanelRule />

          {englishContent.length === 0 ? (
            <EmptyState title={t('library.empty.title')} body={t('library.empty.body')} />
          ) : (
            <ul>
              {englishContent.map((item) => {
                const state = stateOf(index, item.id);
                return (
                  <li key={item.id}>
                    <Link
                      to={`/content/${item.slug}`}
                      className="group flex items-center gap-3 border-t border-rule/60 px-4 py-3.5 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-body font-medium text-legend">
                          {text(item.title, 'en')}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          {state !== 'new' ? (
                            <StateLamp state={state} label={t(`state.${state}`)} />
                          ) : null}
                          <span className="legend-type">
                            {t(`difficulty.${item.difficulty}`)} ·{' '}
                            {t('content.minutes', { count: item.estimatedMinutes })}
                          </span>
                        </span>
                      </span>
                      <LuArrowRight
                        aria-hidden="true"
                        className="shrink-0 text-legend-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-brass"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <aside className="space-y-6">
          {speakingLevel && speakingLevel.contentSeen > 0 ? (
            <Panel className="p-1.5">
              <ChannelStrip
                name={t('english.title')}
                value={speakingLevel.level}
                tone={speakingLevel.level < 0.4 ? 'record' : 'brass'}
              />
            </Panel>
          ) : null}

          <Panel className="overflow-hidden" aria-labelledby="english-metrics">
            <div className="px-4 py-3">
              <Legend id="english-metrics">{t('english.metrics.title')}</Legend>
            </div>
            <PanelRule />

            {latest ? (
              <>
                <dl className="space-y-3 px-4 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="legend-type">{t('english.metrics.duration')}</dt>
                    <dd>
                      <Counter ms={latest.durationMs} className="text-meta" />
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="legend-type">{t('english.metrics.words')}</dt>
                    <dd data-tabular className="font-mono text-meta tabular-nums text-legend-2">
                      ~{words}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="legend-type">{t('english.metrics.pace')}</dt>
                    <dd className="text-meta text-legend-2">
                      {paceLabel}
                      {pace > 0 ? (
                        <span data-tabular className="ml-1.5 font-mono tabular-nums text-legend-3">
                          {pace}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </dl>
                <p className="border-t border-rule px-4 py-3 text-micro leading-relaxed text-legend-3">
                  {t('english.metrics.estimateNote')}
                </p>
              </>
            ) : (
              <p className="px-4 py-6 text-body text-legend-3">{t('english.subtitle')}</p>
            )}
          </Panel>

          {/* Named honestly as not available, rather than shown as a disabled
              feature that implies it exists. */}
          <Panel className="p-4" tone="recess">
            <p className="legend-type mb-2 flex items-center gap-1.5 text-channel2">
              <LuSparkles aria-hidden="true" />
              {t('english.ai.title')}
            </p>
            <p className="text-meta leading-relaxed text-legend-3">{t('english.ai.body')}</p>
          </Panel>
        </aside>
      </div>

      {englishAttempts.length > 0 ? (
        <Panel className="overflow-hidden" aria-labelledby="english-takes">
          <div className="px-4 py-3">
            <Legend id="english-takes">{t('attempt.history')}</Legend>
          </div>
          <PanelRule />
          <ul>
            {englishAttempts.slice(0, 8).map((attempt) => {
              const content = index.byId.get(attempt.contentId);
              return (
                <li
                  key={attempt.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule/60 px-4 py-3 first:border-t-0"
                >
                  <span className="min-w-0 flex-1 truncate text-body text-legend-2">
                    {content ? text(content.title, 'en') : attempt.contentId}
                  </span>
                  <span data-tabular className="font-mono text-meta tabular-nums text-legend-3">
                    {formatDuration(attempt.durationMs)}
                  </span>
                  <span className="text-meta text-legend-3">
                    {t('attempt.words', {
                      count: attempt.estimatedWords ?? estimateWords(attempt.durationMs),
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
