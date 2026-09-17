import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, SKILLS } from '@/data/seed/taxonomy';
import {
  computeSkillLevels,
  computeStreak,
  computeTotals,
  stateOf,
  strongestSkills,
  weakestSkills,
} from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { formatBytes, formatTotalTime } from '@/lib/utils';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { ChannelStrip, LevelMeter } from '@/components/lab/Meters';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState } from '@/components/ui/States';

/**
 * Progress.
 *
 * Everything here answers "what can you now explain, and what can you not".
 * Counts are present but subordinate, because the number of cards finished is
 * not what the product is optimising for.
 */
export function ProgressPage() {
  const { ready, index, snapshot, storageUsedBytes } = useStudy();
  const { t, text, locale } = useI18n();
  const navigate = useNavigate();

  const totals = useMemo(() => computeTotals(index), [index]);
  const levels = useMemo(() => computeSkillLevels(index), [index]);
  const streak = useMemo(() => computeStreak(index.attempts), [index.attempts]);

  const weak = useMemo(() => weakestSkills(levels, 3), [levels]);
  const strong = useMemo(() => strongestSkills(levels, 3), [levels]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((category) => {
        const items = index.content.filter((item) => item.categoryId === category.id);
        if (items.length === 0) return null;
        const mastered = items.filter((item) => stateOf(index, item.id) === 'mastered').length;
        const seen = items.filter((item) => stateOf(index, item.id) !== 'new').length;
        return { category, total: items.length, mastered, seen };
      }).filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    [index],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  const hasEvidence = totals.seen > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
        {t('progress.title')}
      </h1>

      {!hasEvidence ? (
        <Panel>
          <EmptyState
            title={t('progress.empty.title')}
            body={t('progress.empty.body')}
            action={
              <TransportButton variant="primary" onClick={() => navigate('/library')}>
                {t('nav.library')}
              </TransportButton>
            }
          />
        </Panel>
      ) : (
        <>
          {/* Counts, stated plainly and kept in one strip rather than four tiles. */}
          <Panel className="overflow-hidden">
            <dl className="grid divide-y divide-rule sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {[
                { label: t('home.answered'), value: `${totals.seen}/${totals.total}` },
                { label: t('home.mastered'), value: String(totals.mastered) },
                {
                  label: t('home.spokenTime'),
                  value: totals.spokenMs > 0 ? formatTotalTime(totals.spokenMs, locale) : '—',
                },
                {
                  label: t('home.streak'),
                  value:
                    streak > 0
                      ? t(streak === 1 ? 'home.streak.day' : 'home.streak.days', { count: streak })
                      : '—',
                },
              ].map((cell) => (
                <div key={cell.label} className="px-4 py-4">
                  <dt className="legend-type mb-1.5">{cell.label}</dt>
                  <dd data-tabular className="font-mono text-prompt tabular-nums text-legend">
                    {cell.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="overflow-hidden" aria-labelledby="weakest">
              <div className="px-4 py-3">
                <Legend id="weakest">{t('progress.weakest')}</Legend>
              </div>
              <PanelRule />
              {weak.length === 0 ? (
                <p className="px-4 py-6 text-body text-legend-3">{t('progress.needsEvidence')}</p>
              ) : (
                <ol className="p-1.5">
                  {weak.map((level) => {
                    const skill = SKILLS.find((entry) => entry.id === level.skillId);
                    if (!skill) return null;
                    return (
                      <li key={level.skillId}>
                        <ChannelStrip
                          name={text(skill.label)}
                          meaning={text(skill.meaning)}
                          value={level.level}
                          tone="record"
                          href={`/library?skill=${level.skillId}`}
                        />
                      </li>
                    );
                  })}
                </ol>
              )}
            </Panel>

            <Panel className="overflow-hidden" aria-labelledby="strongest">
              <div className="px-4 py-3">
                <Legend id="strongest">{t('progress.strongest')}</Legend>
              </div>
              <PanelRule />
              {strong.length === 0 ? (
                <p className="px-4 py-6 text-body text-legend-3">{t('progress.needsEvidence')}</p>
              ) : (
                <ol className="p-1.5">
                  {strong.map((level) => {
                    const skill = SKILLS.find((entry) => entry.id === level.skillId);
                    if (!skill) return null;
                    return (
                      <li key={level.skillId}>
                        <ChannelStrip
                          name={text(skill.label)}
                          meaning={text(skill.meaning)}
                          value={level.level}
                          tone="monitor"
                          href={`/library?skill=${level.skillId}`}
                        />
                      </li>
                    );
                  })}
                </ol>
              )}
            </Panel>
          </div>

          {/* The full monitor bank. */}
          <Panel className="overflow-hidden" aria-labelledby="all-skills">
            <div className="px-4 py-3">
              <Legend id="all-skills">{t('progress.skills')}</Legend>
            </div>
            <PanelRule />
            <ul className="grid p-1.5 sm:grid-cols-2">
              {levels
                .filter((level) => level.contentSeen > 0)
                .sort((a, b) => b.level - a.level)
                .map((level) => {
                  const skill = SKILLS.find((entry) => entry.id === level.skillId);
                  if (!skill) return null;
                  return (
                    <li key={level.skillId}>
                      <ChannelStrip
                        name={text(skill.label)}
                        value={level.level}
                        tone={level.level < 0.35 ? 'record' : level.level < 0.7 ? 'brass' : 'monitor'}
                        badge={
                          level.dueCount > 0
                            ? t('home.queue.count', { count: level.dueCount })
                            : undefined
                        }
                        lampTone={level.dueCount > 0 ? 'brass' : undefined}
                        href={`/library?skill=${level.skillId}`}
                      />
                    </li>
                  );
                })}
            </ul>
          </Panel>

          <Panel className="overflow-hidden" aria-labelledby="by-category">
            <div className="px-4 py-3">
              <Legend id="by-category">{t('progress.byCategory')}</Legend>
            </div>
            <PanelRule />
            <ul>
              {byCategory.map((entry) => (
                <li
                  key={entry.category.id}
                  className="border-t border-rule/60 px-4 py-3 first:border-t-0"
                >
                  <Link to={`/library?category=${entry.category.id}`} className="block">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-body text-legend">{text(entry.category.label)}</span>
                      <span data-tabular className="font-mono text-meta tabular-nums text-legend-3">
                        {entry.seen}/{entry.total}
                      </span>
                    </div>
                    <LevelMeter
                      value={entry.total ? entry.mastered / entry.total : 0}
                      tone="monitor"
                      className="mt-2"
                      label={`${text(entry.category.label)}: ${entry.mastered}/${entry.total}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}

      <Panel className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Lamp tone={storageUsedBytes > 0 ? 'channel2' : 'off'} />
        <span className="legend-type">{t('progress.storage')}</span>
        <span data-tabular className="ml-auto font-mono text-meta tabular-nums text-legend-2">
          {t('progress.storage.used', {
            count: snapshot.recordings.length,
            size: formatBytes(storageUsedBytes),
          })}
        </span>
      </Panel>
    </div>
  );
}
