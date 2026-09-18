import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMic } from 'react-icons/lu';
import type { Content } from '@/domain/types';
import { activityKindOf, isSpokenActivity } from '@/domain/activity';
import { isDue } from '@/domain/srs';
import { DIFFICULTIES } from '@/data/seed/taxonomy';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n, type StringKey } from '@/i18n';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { EmptyState, PageSkeleton } from '@/components/ui/States';
import { Chip } from '@/components/ui/Chip';
import { ActivityChip } from '@/features/content/ActivityChip';

/**
 * Speaking practice.
 *
 * The one place in the product that is *about* the microphone. Everything
 * here takes a spoken answer, which is what lets the rest of the app stop
 * asking for one in front of every fact.
 */

type SpeakingFilter =
  | 'technical'
  | 'behavioral'
  | 'architecture'
  | 'english'
  | 'hard'
  | 'review'
  | 'recent';

const FILTERS: SpeakingFilter[] = [
  'technical',
  'behavioral',
  'architecture',
  'english',
  'hard',
  'review',
  'recent',
];

export function SpeakingPage() {
  const { ready, index, snapshot } = useStudy();
  const { t, text } = useI18n();
  const navigate = useNavigate();
  const [active, setActive] = useState<SpeakingFilter[]>([]);

  const spoken = useMemo(() => index.content.filter(isSpokenActivity), [index.content]);

  const attemptsByContent = useMemo(() => {
    const counts = new Map<string, { count: number; last: string | null }>();
    for (const attempt of snapshot.attempts) {
      if (attempt.mode !== 'spoken') continue;
      const entry = counts.get(attempt.contentId) ?? { count: 0, last: null };
      entry.count += 1;
      if (!entry.last || attempt.createdAt > entry.last) entry.last = attempt.createdAt;
      counts.set(attempt.contentId, entry);
    }
    return counts;
  }, [snapshot.attempts]);

  const matches = (item: Content, filter: SpeakingFilter) => {
    const attempted = attemptsByContent.get(item.id);
    switch (filter) {
      case 'technical':
        return ['javascript', 'backend', 'database', 'security'].includes(item.categoryId);
      case 'behavioral':
        return item.categoryId === 'behavioral';
      case 'architecture':
        return item.categoryId === 'architecture' || item.categoryId === 'system-design';
      case 'english':
        return item.categoryId === 'english';
      case 'hard':
        return item.difficulty === 'advanced' || item.difficulty === 'expert';
      case 'review':
        return isDue(snapshot.progress[item.id]);
      case 'recent':
        return Boolean(attempted);
      default:
        return true;
    }
  };

  const results = useMemo(() => {
    const filtered = active.length
      ? spoken.filter((item) => active.every((filter) => matches(item, filter)))
      : spoken;

    // Never practised first: the point of this screen is the take you have
    // not taken yet.
    return [...filtered].sort((a, b) => {
      const left = attemptsByContent.get(a.id)?.count ?? 0;
      const right = attemptsByContent.get(b.id)?.count ?? 0;
      if (left !== right) return left - right;
      return text(a.title).localeCompare(text(b.title));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spoken, active, attemptsByContent, text]);

  const unpractised = spoken.filter((item) => !attemptsByContent.has(item.id));
  const waiting = unpractised.length;
  const firstUnpractised = results.find((item) => !attemptsByContent.has(item.id)) ?? results[0];

  if (!ready) return <PageSkeleton label={t('common.loading')} rows={2} />;

  return (
    <div className="mx-auto max-w-[60rem] space-y-6">
      <div className="space-y-2">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
          {t('speaking.title')}
        </h1>
        <p className="max-w-read text-body text-legend-3">{t('speaking.subtitle')}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="legend-type" data-tabular>
            {t('speaking.waiting', { count: waiting })}
          </span>
          <Link
            to="/english"
            className="rounded-[2px] text-meta text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
          >
            {t('speaking.englishArea')}
          </Link>
        </p>
      </div>

      {/* The one lit key on this screen: the take you have not taken yet. */}
      {firstUnpractised ? (
        <TransportButton
          variant="primary"
          size="lg"
          icon={<LuMic />}
          onClick={() => navigate(`/content/${firstUnpractised.slug}`)}
        >
          {t('speaking.startFirst')}
        </TransportButton>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Chip
            key={filter}
            active={active.includes(filter)}
            onClick={() =>
              setActive((previous) =>
                previous.includes(filter)
                  ? previous.filter((entry) => entry !== filter)
                  : [...previous, filter],
              )
            }
          >
            {t(`speaking.filter.${filter}` as StringKey)}
          </Chip>
        ))}
      </div>

      <Panel className="overflow-hidden" aria-labelledby="speaking-list">
        <PanelHeader
          legend={t('speaking.title')}
          headingId="speaking-list"
          actions={
            <span className="legend-type" data-tabular>
              {results.length}
            </span>
          }
        />
        <PanelRule />

        {results.length === 0 ? (
          <EmptyState
            icon={<LuMic />}
            title={t('speaking.empty')}
            body={t('speaking.subtitle')}
          />
        ) : (
          <ul>
            {results.map((item) => {
              const attempted = attemptsByContent.get(item.id);
              const difficulty = DIFFICULTIES.find((entry) => entry.id === item.difficulty);
              return (
                <li key={item.id}>
                  <Link
                    to={`/content/${item.slug}`}
                    className="group block border-t border-rule/60 px-4 py-3.5 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                  >
                    <span className="flex items-start gap-4">
                      <span className="min-w-0 flex-1 text-body text-legend">
                        {text(item.title)}
                      </span>
                      {/* Only what there is. A row never prints "new". */}
                      {attempted ? (
                        <span className="legend-type shrink-0 text-legend-2" data-tabular>
                          {t(attempted.count === 1 ? 'speaking.attempt' : 'speaking.attempts', {
                            count: attempted.count,
                          })}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <ActivityChip kind={activityKindOf(item)} showMode={false} />
                      <span className="legend-type whitespace-nowrap" data-tabular>
                        {[
                          difficulty ? text(difficulty.label) : null,
                          t('content.minutes', { count: item.estimatedMinutes }),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

export { SpeakingPage as default };
