import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowRight, LuFlame, LuLock, LuMic, LuTriangleAlert } from 'react-icons/lu';
import type { Content } from '@/domain/types';
import { CATEGORIES, SKILLS } from '@/data/seed/taxonomy';
import {
  computeSkillLevels,
  computeStreak,
  computeTotals,
  dueContent,
  stateOf,
} from '@/domain/selectors';
import { sessionProgress, summariseSession, type PracticeSize } from '@/domain/practice';
import { useStudy } from '@/app/providers/StudyProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useI18n } from '@/i18n';
import { formatTotalTime } from '@/lib/utils';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { ChannelStrip, LevelMeter } from '@/components/lab/Meters';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading } from '@/components/ui/States';
import { renderInline } from '@/features/content/blocks/Prose';
import { PlanMeta, SessionRail, WhyTheseActivities } from '@/features/practice/PracticeParts';

/**
 * The skills shown before there is any evidence. At zero, with their lamps
 * off, they tell a first-time user what the instrument will measure instead
 * of a sentence saying that it will.
 */
const DEFAULT_MONITORS = [
  'javascript',
  'nodejs',
  'api-design',
  'databases',
  'system-design',
  'english-speaking',
];

/**
 * The question as the interviewer would ask it.
 *
 * A prompt that only makes sense next to its code ("what does this print?")
 * falls back to the title, which carries the subject on its own.
 */
function deckQuestion(content: Content, text: (value: Content['title']) => string): string {
  const hasCode = content.blocks.some((block) => block.phase === 'prompt' && block.kind === 'code');
  const prompt = content.blocks.find((block) => block.kind === 'prompt');
  if (hasCode || prompt?.kind !== 'prompt') return text(content.title);
  return text(prompt.text) || text(content.title);
}

/**
 * The lab console.
 *
 * Today's Practice is the loaded deck: open the app, press Start, practise.
 * The deck shows exactly one next question and one way to begin, with channel
 * two inert beside it. The user should never have to decide what to study
 * before they can start — that decision is the generator's job, and the
 * "why these activities" line shows its working.
 */
export function HomePage() {
  const { ready, index, snapshot, todaySession, practicePreferences, planPractice, startPractice } = useStudy();
  const { user } = useAuth();
  const { t, text, locale } = useI18n();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const totals = useMemo(() => computeTotals(index), [index]);
  const streak = useMemo(() => computeStreak(index.attempts), [index.attempts]);
  const levels = useMemo(() => computeSkillLevels(index), [index]);
  const due = useMemo(() => dueContent(index), [index]);

  const goal = practicePreferences.dailyGoal;
  const goalPlan = useMemo(() => planPractice(goal), [planPractice, goal]);
  const quickPlan = useMemo(() => planPractice(5), [planPractice]);

  const monitorBank = useMemo(() => {
    const practised = levels
      .filter((level) => level.contentSeen > 0)
      .sort((a, b) => a.level - b.level);
    const seenIds = new Set(practised.map((level) => level.skillId));
    const silent = DEFAULT_MONITORS.filter((id) => !seenIds.has(id)).map((skillId) => ({
      skillId,
      level: 0,
      contentSeen: 0,
      contentMastered: 0,
      dueCount: 0,
      lastPracticedAt: null,
    }));
    // With no evidence yet, four silent strips say what gets measured without
    // letting a column of zeros outweigh the deck.
    return [...practised, ...silent].slice(0, practised.length > 0 ? 6 : 4);
  }, [levels]);

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('home.greeting.morning')
      : hour < 19
        ? t('home.greeting.afternoon')
        : t('home.greeting.evening');
  const name = snapshot.profile?.displayName || user?.displayName?.split(' ')[0] || '';

  const progress = todaySession ? sessionProgress(todaySession, index.byId) : null;
  const inProgress = Boolean(todaySession && progress && !progress.complete && !todaySession.endedEarly);
  const finishedToday = Boolean(todaySession && progress && (progress.complete || todaySession.endedEarly));
  const showQuick = !inProgress && (goal !== 5 || finishedToday) && quickPlan.length > 0;

  const nextItem = inProgress ? todaySession?.items.find((item) => item.status === 'pending') : undefined;
  const upNext: Content | undefined = inProgress
    ? nextItem && index.byId.get(nextItem.contentId)
    : finishedToday
      ? undefined
      : goalPlan[0]?.content;

  const start = async (size: PracticeSize) => {
    setStarting(true);
    try {
      if (await startPractice(size)) navigate('/practice/session');
    } finally {
      setStarting(false);
    }
  };

  const whyPlan = inProgress && todaySession
    ? todaySession.items
        .map((item) => {
          const content = index.byId.get(item.contentId);
          return content ? { content, reason: item.reason } : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    : goalPlan;

  const summary = finishedToday && todaySession ? summariseSession(todaySession, index.byId) : null;

  return (
    <div className={`grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] ${showQuick ? 'xl:grid-rows-[auto_auto_auto_1fr]' : 'xl:grid-rows-[auto_auto_1fr]'}`}>
      {/* --- today's practice: the loaded deck ------------------------------ */}
      <div className="min-w-0 space-y-3 xl:col-start-1 xl:row-start-1">
        <p className="flex flex-wrap items-center gap-x-1.5 text-meta text-legend-3">
          <span className="text-legend-2">
            {greeting}
            {name ? `, ${name}` : ''}
          </span>
          <span aria-hidden="true">·</span>
          {streak > 0 ? (
            <span className="inline-flex items-center gap-1 text-legend-2">
              <LuFlame aria-hidden="true" className="text-legend-3" />
              {t(streak === 1 ? 'home.streak.day' : 'home.streak.days', { count: streak })}
            </span>
          ) : (
            <span>{t('home.streak.none')}</span>
          )}
          {totals.spokenMs > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatTotalTime(totals.spokenMs, locale)}</span>
            </>
          ) : null}
        </p>

        <Panel className="overflow-hidden" aria-labelledby="practice-heading">
          <PanelHeader
            legend={finishedToday ? t('practice.done.title') : t('practice.title')}
            headingId="practice-heading"
            actions={
              inProgress && progress ? (
                <span data-tabular className="font-mono text-meta tabular-nums text-legend-2">
                  {t('practice.progress', { done: progress.done, total: progress.total })}
                </span>
              ) : finishedToday && progress ? (
                <span data-tabular className="font-mono text-meta tabular-nums text-legend-2">
                  {progress.done} / {progress.total}
                </span>
              ) : (
                <PlanMeta contents={goalPlan.map((entry) => entry.content)} size={goalPlan.length} />
              )
            }
          />

          {todaySession ? (
            <div className="px-4 pb-1">
              <SessionRail
                items={todaySession.items}
                label={t('practice.progress', { done: progress?.done ?? 0, total: progress?.total ?? 0 })}
              />
            </div>
          ) : null}

          {upNext ? (
            <div className="px-4 pb-5 pt-4">
              <h1 className="max-w-read text-prompt font-medium leading-snug text-legend sm:text-prompt-lg">
                {renderInline(deckQuestion(upNext, text))}
              </h1>
              <p className="legend-type mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 leading-[1.5]">
                <span>
                  {[
                    text(CATEGORIES.find((c) => c.id === upNext.categoryId)?.label),
                    t(`difficulty.${upNext.difficulty}`),
                  ].join(' · ')}
                </span>
                {upNext.isTrap ? (
                  <span className="inline-flex items-center gap-1">
                    · <LuTriangleAlert aria-hidden="true" />
                    {t('content.trap')}
                  </span>
                ) : null}
              </p>
            </div>
          ) : summary ? (
            <div className="px-4 pb-5 pt-4">
              <p className="text-body text-legend-2">
                {t('practice.progress', { done: summary.completed, total: summary.total })} ·{' '}
                {t('practice.summary.knew')} {summary.knew} · {t('practice.summary.recordings')} {summary.recordings}
              </p>
            </div>
          ) : (
            <p className="px-4 py-5 text-body text-legend-3">{t('practice.empty')}</p>
          )}

          {/* The transport row: one key, and channel two inert beside it. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-rule bg-felt px-4 py-3">
            {finishedToday && todaySession ? (
              <TransportButton
                variant="neutral"
                size="lg"
                icon={<LuArrowRight />}
                onClick={() => navigate(`/practice/session?id=${todaySession.id}`)}
              >
                {t('practice.done.seeSummary')}
              </TransportButton>
            ) : (
              <TransportButton
                variant="record"
                size="lg"
                icon={<LuMic />}
                disabled={starting || (!inProgress && goalPlan.length === 0)}
                onClick={() => (inProgress ? navigate('/practice/session') : void start(goal))}
              >
                {inProgress ? t('practice.continue') : t('practice.start')}
              </TransportButton>
            )}

            {inProgress && progress ? (
              <span className="text-meta text-legend-3">
                {t('practice.remaining', { minutes: progress.remainingMinutes })}
              </span>
            ) : !finishedToday ? (
              <span className="flex min-w-[12rem] flex-1 flex-col gap-1.5" title={t('home.channel2.help')}>
                <span className="inline-flex items-center gap-2">
                  <LuLock aria-hidden="true" className="shrink-0 text-channel2" />
                  <span className="legend-type whitespace-nowrap text-channel2 line-through decoration-channel2/50">
                    {t('home.channel2')}
                  </span>
                </span>
                <LevelMeter value={0} tone="channel2" label={t('home.channel2.help')} />
              </span>
            ) : null}
          </div>

          {!finishedToday && whyPlan.length > 0 ? (
            <div className="border-t border-rule px-4 py-3">
              <WhyTheseActivities plan={whyPlan} />
            </div>
          ) : null}
        </Panel>
      </div>

      {/* --- got five minutes? ----------------------------------------------- */}
      {showQuick ? (
        <Panel className="min-w-0 xl:col-start-1 xl:row-start-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-body font-medium text-legend">{t('practice.quick.title')}</span>
              <span className="mt-0.5 block">
                <PlanMeta contents={quickPlan.map((entry) => entry.content)} size={quickPlan.length} />
              </span>
            </span>
            <TransportButton variant="neutral" disabled={starting} onClick={() => void start(5)}>
              {t('practice.start')}
            </TransportButton>
          </div>
        </Panel>
      ) : null}

      {/* --- today's take sheet ------------------------------------------- */}
      <Panel className={`min-w-0 overflow-hidden xl:col-start-1 ${showQuick ? 'xl:row-start-3' : 'xl:row-start-2'}`} aria-labelledby="queue-heading">
        <PanelHeader
          legend={t('home.queue.title')}
          headingId="queue-heading"
          actions={
            due.length > 0 ? (
              <span className="legend-type" data-tabular>
                {t('home.queue.count', { count: due.length })}
              </span>
            ) : undefined
          }
        />
        <PanelRule />

        {due.length === 0 ? (
          <p className="px-4 py-5 text-body text-legend-3">{t('home.queue.empty')}</p>
        ) : (
          <ul>
            {due.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  to={`/content/${item.slug}`}
                  className="group flex items-center gap-3 border-t border-rule/60 px-4 py-3 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                >
                  <Lamp tone="brass" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-legend">{text(item.title)}</span>
                    <span className="legend-type mt-1 block">
                      {text(CATEGORIES.find((c) => c.id === item.categoryId)?.label)} ·{' '}
                      {t(`difficulty.${item.difficulty}`)}
                    </span>
                  </span>
                  <LuArrowRight
                    aria-hidden="true"
                    className="shrink-0 text-legend-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-legend"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {due.length > 5 ? (
          <div className="border-t border-rule bg-felt px-4 py-3">
            <TransportButton variant="neutral" size="sm" onClick={() => navigate('/flashcards')}>
              {t('action.seeAll')}
            </TransportButton>
          </div>
        ) : null}
      </Panel>

      {/* --- the monitor bank: skills plus the counts, as readouts ----------- */}
      <aside className={`min-w-0 xl:col-start-2 ${showQuick ? 'xl:row-span-4' : 'xl:row-span-3'} xl:row-start-1 xl:self-start`}>
        <Panel className="overflow-hidden" aria-labelledby="monitor-heading">
          <PanelHeader legend={t('home.monitor.title')} headingId="monitor-heading" />
          <PanelRule />

          <div className="p-1.5">
            <ChannelStrip
              name={t('home.coverage')}
              value={totals.total ? totals.seen / totals.total : 0}
              tone="monitor"
              badge={t('home.coverage.badge', {
                seen: totals.seen,
                total: totals.total,
                mastered: totals.mastered,
              })}
              lampTone={totals.seen > 0 ? 'monitor' : 'off'}
            />
          </div>

          <PanelRule />

          <div className="p-1.5">
            {monitorBank.map((level) => {
              const skill = SKILLS.find((entry) => entry.id === level.skillId);
              if (!skill) return null;
              const silent = level.contentSeen === 0;
              return (
                <ChannelStrip
                  compact
                  key={level.skillId}
                  name={text(skill.label)}
                  value={level.level}
                  tone={level.level < 0.35 ? 'record' : level.level < 0.7 ? 'brass' : 'monitor'}
                  badge={
                    silent
                      ? t('home.noSignal')
                      : level.dueCount > 0
                        ? t('home.queue.count', { count: level.dueCount })
                        : undefined
                  }
                  lampTone={silent ? 'off' : level.dueCount > 0 ? 'brass' : undefined}
                  href={`/library?skill=${level.skillId}`}
                />
              );
            })}
          </div>

          <div className="border-t border-rule bg-felt px-4 py-3">
            <TransportButton variant="neutral" size="sm" onClick={() => navigate('/progress')}>
              {t('nav.progress')}
            </TransportButton>
          </div>
        </Panel>
      </aside>

      {/* --- subjects: a selector, not a grid of cards --------------------- */}
      <Panel className={`min-w-0 self-start overflow-hidden xl:col-start-1 ${showQuick ? 'xl:row-start-4' : 'xl:row-start-3'}`} aria-labelledby="subjects-heading">
        <PanelHeader legend={t('home.subjects')} headingId="subjects-heading" />
        <PanelRule />
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
