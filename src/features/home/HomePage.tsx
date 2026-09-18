import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowRight, LuFlame, LuMic } from 'react-icons/lu';
import { CATEGORIES, SKILLS } from '@/data/seed/taxonomy';
import { LEARNING_PATHS } from '@/data/seed/paths';
import {
  computeSkillLevels,
  computeStreak,
  computeTotals,
  dueContent,
  stateOf,
} from '@/domain/selectors';
import { pathProgress, recommendPath } from '@/domain/paths';
import { activityKindOf, isSpokenActivity } from '@/domain/activity';
import { sessionProgress, summariseSession, type PracticeSize } from '@/domain/practice';
import { useStudy } from '@/app/providers/StudyProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useI18n } from '@/i18n';
import { formatTotalTime } from '@/lib/utils';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { ChannelStrip } from '@/components/lab/Meters';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { InlineSpinner, PageSkeleton } from '@/components/ui/States';
import { PlanMeta, SessionRail, WhyTheseActivities } from '@/features/practice/PracticeParts';
import { ActivityChip } from '@/features/content/ActivityChip';

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
 * Home.
 *
 * Four things, in the order somebody actually decides between them: carry on
 * learning something, do today's practice, answer something out loud, or go
 * looking. Each one says what it is and how long it takes before it is
 * pressed, and exactly one key on the screen is lit — the one this user should
 * press now. Everything else is neutral, so the screen recommends instead of
 * presenting four equal options.
 */
export function HomePage() {
  const { ready, index, snapshot, todaySession, practicePreferences, planPractice, startPractice } =
    useStudy();
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

  const paths = useMemo(
    () => LEARNING_PATHS.map((path) => pathProgress(path, index.byId, snapshot.progress)),
    [index.byId, snapshot.progress],
  );
  const featuredPath = useMemo(() => recommendPath(paths), [paths]);

  const speakingWaiting = useMemo(() => {
    const spoken = index.content.filter(isSpokenActivity);
    const attempted = new Set(
      snapshot.attempts.filter((a) => a.mode === 'spoken').map((a) => a.contentId),
    );
    return spoken.filter((item) => !attempted.has(item.id)).length;
  }, [index.content, snapshot.attempts]);

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
    return [...practised, ...silent].slice(0, practised.length > 0 ? 6 : 4);
  }, [levels]);

  if (!ready) return <PageSkeleton label={t('common.loading')} rows={3} />;

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('home.greeting.morning')
      : hour < 19
        ? t('home.greeting.afternoon')
        : t('home.greeting.evening');
  const name = snapshot.profile?.displayName || user?.displayName?.split(' ')[0] || '';

  const progress = todaySession ? sessionProgress(todaySession, index.byId) : null;
  const inProgress = Boolean(
    todaySession && progress && !progress.complete && !todaySession.endedEarly,
  );
  const finishedToday = Boolean(
    todaySession && progress && (progress.complete || todaySession.endedEarly),
  );

  /**
   * One lit key per screen. A session left half-finished outranks everything;
   * after that, a path in the middle; otherwise today's practice.
   */
  const lit: 'practice' | 'path' =
    inProgress || finishedToday
      ? 'practice'
      : featuredPath && featuredPath.started && !featuredPath.complete
        ? 'path'
        : 'practice';

  const start = async (size: PracticeSize) => {
    setStarting(true);
    try {
      if (await startPractice(size)) navigate('/practice/session');
    } finally {
      setStarting(false);
    }
  };

  const whyPlan =
    inProgress && todaySession
      ? todaySession.items
          .map((item) => {
            const content = index.byId.get(item.contentId);
            return content ? { content, reason: item.reason } : null;
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      : goalPlan;

  /** The activity this session will actually put on screen first. */
  const practiceOpener = inProgress
    ? index.byId.get(todaySession?.items.find((item) => item.status === 'pending')?.contentId ?? '')
    : goalPlan[0]?.content;

  const summary = finishedToday && todaySession ? summariseSession(todaySession, index.byId) : null;

  const greetingLine = (
    <p className="flex flex-wrap items-center gap-x-1.5 text-meta text-legend-3">
      <span className="text-legend-2">
        {greeting}
        {name ? `, ${name}` : ''}
      </span>
      <span aria-hidden="true">·</span>
      {streak > 0 ? (
        <span className="inline-flex items-center gap-1 text-legend-2">
          <LuFlame aria-hidden="true" className="text-legend-3" />
          {t(streak === 1 ? 'home.streak.day' : 'home.streak.days', {
            count: streak,
          })}
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
  );

  const learnPanel = featuredPath ? (
    <Panel className="overflow-hidden" aria-labelledby="home-learn">
      <PanelHeader
        legend={featuredPath.started ? t('home.section.learn') : t('home.learn.startTitle')}
        headingId="home-learn"
        actions={
          <span className="legend-type" data-tabular>
            {featuredPath.complete
              ? t('path.done')
              : t('path.stepOf', {
                  current: featuredPath.position,
                  total: featuredPath.total,
                })}
          </span>
        }
      />
      <SessionRail
        className="mx-4"
        label={text(featuredPath.path.title)}
        items={featuredPath.steps.map((step) => ({
          status: step.done ? 'done' : 'pending',
        }))}
        position={featuredPath.position - 1}
      />

      <div className="px-4 pb-5 pt-4">
        <HomeTitle lit={lit === 'path'}>{text(featuredPath.path.title)}</HomeTitle>
        <p className="mt-2 max-w-read text-body text-legend-3">
          {featuredPath.started ? text(featuredPath.path.summary) : t('home.learn.startBody')}
        </p>
        {featuredPath.next ? (
          <p className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <ActivityChip kind={activityKindOf(featuredPath.next)} />
            <span className="text-body text-legend-2">{text(featuredPath.next.title)}</span>
          </p>
        ) : null}
      </div>

      <PanelRule />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-felt px-4 py-3">
        <TransportButton
          variant={lit === 'path' ? 'primary' : 'neutral'}
          size="lg"
          icon={lit === 'path' ? undefined : <LuArrowRight />}
          onClick={() =>
            navigate(
              featuredPath.next
                ? `/content/${featuredPath.next.slug}`
                : `/learn/${featuredPath.path.slug}`,
            )
          }
        >
          {featuredPath.complete
            ? t('path.restart')
            : featuredPath.started
              ? t('action.continue')
              : t('path.start')}
        </TransportButton>
        <span className="legend-type" data-tabular>
          {t('path.remaining', { count: featuredPath.minutesLeft })}
        </span>
        <Link
          to="/learn"
          className="ml-auto rounded-[2px] text-meta text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
        >
          {t('nav.learn')}
        </Link>
      </div>
    </Panel>
  ) : null;

  const practicePanel = (
    <Panel className="overflow-hidden" aria-labelledby="practice-heading">
      <PanelHeader
        legend={finishedToday ? t('practice.done.title') : t('home.section.practice')}
        headingId="practice-heading"
        actions={
          inProgress && progress ? (
            <span data-tabular className="font-mono text-meta tabular-nums text-legend-2">
              {t('practice.progress', {
                done: progress.done,
                total: progress.total,
              })}
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
            label={t('practice.progress', {
              done: progress?.done ?? 0,
              total: progress?.total ?? 0,
            })}
          />
        </div>
      ) : null}

      <div className="px-4 pb-5 pt-4">
        {/* The heading names what this session actually opens with, not the
            panel it sits in: a heading that repeats its own legend says
            nothing twice. */}
        <HomeTitle lit={lit === 'practice'}>
          {finishedToday
            ? t('practice.done.title')
            : practiceOpener
              ? text(practiceOpener.title)
              : t('home.section.practice')}
        </HomeTitle>
        <p className="mt-2 max-w-read text-body text-legend-2">
          {finishedToday && summary
            ? `${t('practice.progress', { done: summary.completed, total: summary.total })} · ${t('practice.summary.knew')} ${summary.knew}`
            : inProgress && progress
              ? t('practice.remaining', { minutes: progress.remainingMinutes })
              : t('practice.subtitle')}
        </p>

        {/* The mix, before anything is pressed: a session is never ten of
                the same thing, and the chips are how that is visible. */}
        {!finishedToday && goalPlan.length > 0 && !inProgress ? (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {[...new Set(goalPlan.map((entry) => activityKindOf(entry.content)))]
              .slice(0, 6)
              .map((kind) => (
                <ActivityChip key={kind} kind={kind} />
              ))}
          </div>
        ) : null}
      </div>

      <PanelRule />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-felt px-4 py-3">
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
            variant={lit === 'practice' ? 'primary' : 'neutral'}
            size="lg"
            icon={lit === 'practice' ? undefined : <LuArrowRight />}
            disabled={starting || (!inProgress && goalPlan.length === 0)}
            onClick={() => (inProgress ? navigate('/practice/session') : void start(goal))}
          >
            {inProgress ? t('practice.continue') : t('practice.start')}
          </TransportButton>
        )}
        {starting ? <InlineSpinner label={t('loading.practice')} /> : null}
        <Link
          to="/practice"
          className="ml-auto rounded-[2px] text-meta text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
        >
          {t('practice.sessions')}
        </Link>
      </div>

      {!finishedToday && whyPlan.length > 0 ? (
        <div className="border-t border-rule px-4 py-3">
          <WhyTheseActivities plan={whyPlan} />
        </div>
      ) : null}
    </Panel>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6 xl:col-start-1">
        {greetingLine}

        {/* The lit key and the biggest type belong to the same section: the
            page recommends one thing rather than presenting four. */}
        {lit === 'practice' ? (
          <>
            {practicePanel}
            {learnPanel}
          </>
        ) : (
          <>
            {learnPanel}
            {practicePanel}
          </>
        )}

        {/* --- speaking practice ------------------------------------------- */}
        <Panel className="overflow-hidden" aria-labelledby="home-speaking">
          <PanelHeader legend={t('home.section.speaking')} headingId="home-speaking" />
          <PanelRule />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4">
            <span className="min-w-0 flex-1">
              <span className="block text-body text-legend-2">{t('speaking.homeBody')}</span>
              <span className="legend-type mt-1.5 block" data-tabular>
                {t('speaking.waiting', { count: speakingWaiting })}
              </span>
            </span>
            <TransportButton
              variant="neutral"
              icon={<LuMic />}
              onClick={() => navigate('/speaking')}
            >
              {t('nav.speaking')}
            </TransportButton>
          </div>
        </Panel>

        {/* --- 4. explore --------------------------------------------------- */}
        <Panel className="overflow-hidden" aria-labelledby="subjects-heading">
          <PanelHeader legend={t('home.section.explore')} headingId="subjects-heading" />
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

      {/* --- the monitor bank, with what is due beneath it ------------------- */}
      <aside className="min-w-0 space-y-6 xl:col-start-2 xl:self-start">
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

        <Panel className="overflow-hidden" aria-labelledby="queue-heading">
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
            <p className="px-4 py-4 text-meta text-legend-3">{t('home.queue.empty')}</p>
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
                      <span className="block truncate text-body text-legend">
                        {text(item.title)}
                      </span>
                      <span className="legend-type mt-1 block">
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
        </Panel>
      </aside>
    </div>
  );
}

/**
 * A section heading on Home.
 *
 * The recommended section gets prompt scale; the alternatives below it get
 * body scale. Size is how the page ranks them, and it always agrees with
 * which key is lit.
 */
function HomeTitle({ lit, children }: { lit: boolean; children: ReactNode }) {
  const Tag = lit ? 'h1' : 'h2';
  return (
    <Tag
      className={
        lit
          ? 'max-w-read text-prompt font-medium leading-snug text-legend sm:text-prompt-lg'
          : 'max-w-read text-body-lg font-medium text-legend'
      }
    >
      {children}
    </Tag>
  );
}
