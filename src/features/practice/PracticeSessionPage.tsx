import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LuArrowRight,
  LuBlocks,
  LuCheck,
  LuCode,
  LuLanguages,
  LuMic,
  LuRotateCcw,
  LuShieldCheck,
  LuUsers,
  LuWrench,
  LuX,
} from 'react-icons/lu';
import type { Confidence, Locale } from '@/domain/types';
import { CATEGORIES } from '@/data/seed/taxonomy';
import {
  recommendAfterSession,
  sessionProgress,
  summariseSession,
  type PracticeItem,
  type PracticeKind,
  type PracticeSession,
} from '@/domain/practice';
import { attemptsFor } from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { ChannelStrip } from '@/components/lab/Meters';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState } from '@/components/ui/States';
import { Mark } from '@/components/brand/Wordmark';
import { ContentRenderer } from '@/features/content/ContentRenderer';
import type { RecordedTake } from '@/hooks/useRecorder';
import { SessionRail, sessionName } from './PracticeParts';
import { responseModeOf } from '@/domain/activity';

/**
 * Practice mode.
 *
 * Immersive on purpose: no rail, no tab bar, nothing to wander off to. Only
 * the session's own progress, the activity on screen, a way forward and a way
 * out. Every change saves immediately, so leaving is never a loss.
 *
 * The flow borrows a feed's rhythm — open, practise, finish, next — and none of
 * its mechanics: nothing advances on its own, the next item appears only after
 * the user acts, and the session ends. There is no "one more".
 */

const PRACTICE_CONFIDENCE: Confidence[] = ['unknown', 'partial', 'known', 'easy'];

export function PracticeSessionPage() {
  const study = useStudy();
  const { ready, index, practiceSessions, todaySession, savePracticeSession } = study;
  const { answerLocale } = useSettings();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedId = params.get('id');
  const stored = useMemo(
    () =>
      requestedId
        ? (practiceSessions.find((session) => session.id === requestedId) ?? null)
        : todaySession,
    [practiceSessions, requestedId, todaySession],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  if (!stored) {
    return (
      <div className="mx-auto max-w-read px-4 py-16">
        <Panel>
          <EmptyState
            title={t('practice.title')}
            body={t('practice.subtitle')}
            action={
              <TransportButton variant="neutral" onClick={() => navigate('/practice')}>
                {t('practice.start')}
              </TransportButton>
            }
          />
        </Panel>
      </div>
    );
  }

  const progress = sessionProgress(stored, index.byId);
  if (progress.complete || stored.endedEarly) {
    return <PracticeSummary session={stored} />;
  }

  return (
    <SessionRunner
      key={stored.id}
      session={stored}
      answerLocale={answerLocale}
      onSave={savePracticeSession}
    />
  );
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function SessionRunner({
  session: initial,
  answerLocale,
  onSave,
}: {
  session: PracticeSession;
  answerLocale: Locale;
  onSave: (session: PracticeSession) => Promise<void>;
}) {
  const {
    index,
    entitlements,
    saveAttempt,
    grade,
    markRevealedWithoutAttempt,
    deleteAttempt,
    toggleStarred,
    toggleFavorite,
    getRecordingUrl,
    sourceById,
  } = useStudy();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [session, setSession] = useState(initial);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // Resume on the first activity that still needs doing.
  const position = useMemo(() => {
    const pending = session.items.findIndex((item) => item.status === 'pending');
    return pending === -1 ? session.items.length - 1 : Math.max(pending, 0);
  }, [session.items]);

  const [viewing, setViewing] = useState(position);
  const item = session.items[viewing];
  const content = item ? index.byId.get(item.contentId) : undefined;

  const persist = useCallback(
    (next: PracticeSession) => {
      setSession(next);
      void onSave(next);
    },
    [onSave],
  );

  const updateItem = useCallback(
    (patch: Partial<PracticeItem>) => {
      setSession((current) => {
        const items = current.items.map((entry, entryIndex) =>
          entryIndex === viewing ? { ...entry, ...patch } : entry,
        );
        const next = { ...current, items, position: viewing };
        void onSave(next);
        return next;
      });
    },
    [viewing, onSave],
  );

  // The clock for an activity starts when it is on screen, not when the
  // session was created, so the summary's time reflects real practice.
  useEffect(() => {
    if (item && item.status === 'pending' && !item.startedAt) {
      updateItem({ startedAt: new Date().toISOString() });
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [viewing]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemDone = item?.status === 'done';

  useEffect(() => {
    if (itemDone) nextRef.current?.focus({ preventScroll: true });
  }, [itemDone]);

  const attempts = useMemo(() => (content ? attemptsFor(index, content.id) : []), [index, content]);

  const latestAttemptSince = useCallback(
    (since: string | null) =>
      [...attempts].reverse().find((attempt) => !since || attempt.createdAt >= since) ?? null,
    [attempts],
  );

  const finishItem = useCallback(
    (
      confidence: Confidence,
      mode: PracticeItem['mode'],
      durationMs: number,
      attemptId: string | null,
    ) => {
      updateItem({
        status: 'done',
        confidence,
        mode,
        durationMs,
        attemptId,
        finishedAt: new Date().toISOString(),
      });
    },
    [updateItem],
  );

  if (!item || !content) {
    // The content bank changed under a saved session: skip what no longer exists.
    return (
      <div className="mx-auto max-w-read px-4 py-16">
        <Panel>
          <EmptyState
            title={t('content.notFound.title')}
            body={t('content.notFound.body')}
            action={
              <TransportButton
                variant="neutral"
                onClick={() => {
                  updateItem({ status: 'skipped', finishedAt: new Date().toISOString() });
                  setViewing((current) => Math.min(current + 1, session.items.length - 1));
                }}
              >
                {t('practice.skip')}
              </TransportButton>
            }
          />
        </Panel>
      </div>
    );
  }

  const isLast = viewing >= session.items.length - 1;
  const doneCount = session.items.filter((entry) => entry.status !== 'pending').length;
  const remaining = sessionProgress(session, index.byId).remainingMinutes;

  const advance = () => {
    if (isLast) {
      persist({ ...session, completedAt: new Date().toISOString(), position: viewing });
      return;
    }
    setViewing((current) => current + 1);
  };

  const skip = () => {
    const items = session.items.map((entry, entryIndex) =>
      entryIndex === viewing
        ? { ...entry, status: 'skipped' as const, finishedAt: new Date().toISOString() }
        : entry,
    );
    const allFinished = items.every((entry) => entry.status !== 'pending');
    persist({
      ...session,
      items,
      position: viewing,
      completedAt: isLast && allFinished ? new Date().toISOString() : session.completedAt,
    });
    if (!isLast) setViewing((current) => current + 1);
  };

  return (
    <div className="min-h-dvh">
      {/* --- the only chrome: where you are, and a way out ----------------- */}
      <header className="sticky top-0 z-30 border-b border-rule bg-booth/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[52rem] items-center gap-3 px-4">
          <Mark size={20} />
          <span className="legend-type hidden sm:inline">{t(sessionName(session.size))}</span>
          <span
            data-tabular
            className="whitespace-nowrap font-mono text-body tabular-nums text-legend"
          >
            {viewing + 1} / {session.items.length}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Lamp tone={item.reason === 'review' || item.reason === 'missed' ? 'brass' : 'off'} />
            <span className="legend-type truncate">{t(`practice.reason.${item.reason}`)}</span>
          </span>
          <span className="hidden whitespace-nowrap text-meta text-legend-3 md:inline">
            {remaining > 0 ? t('practice.remaining', { minutes: remaining }) : null}
          </span>
          <TransportButton
            className="ml-auto"
            variant="quiet"
            size="sm"
            icon={<LuX />}
            title={t('practice.exit.saved')}
            aria-label={t('practice.exit')}
            onClick={() => navigate('/')}
          >
            <span className="hidden whitespace-nowrap sm:inline">{t('practice.exit')}</span>
          </TransportButton>
        </div>
        <div className="mx-auto max-w-[52rem] px-4 pb-2.5">
          <SessionRail
            items={session.items}
            position={viewing}
            label={t('practice.progress', { done: doneCount, total: session.items.length })}
          />
        </div>
      </header>

      {/* --- the activity ------------------------------------------------- */}
      <main id="main" className="mx-auto max-w-[52rem] px-4 pb-40 pt-6">
        <div key={`${session.id}-${viewing}`} className="animate-tape-engage">
          <ContentRenderer
            content={content}
            attempts={attempts}
            answerLocale={answerLocale}
            isFavorite={index.favorites.has(content.id)}
            maxRecordingMs={entitlements.maxRecordingMs}
            onToggleFavorite={() => toggleFavorite(content.id)}
            gateSince={item.startedAt ?? undefined}
            confidenceChoices={PRACTICE_CONFIDENCE}
            hideRelated
            autoFocusRecord={responseModeOf(content) === 'speak'}
            onSaveTake={async (take: RecordedTake, locale: Locale) => {
              await saveAttempt({
                contentId: content.id,
                mode: 'spoken',
                locale,
                durationMs: take.durationMs,
                blob: take.blob,
                peaks: take.peaks,
              });
            }}
            onSilentAttempt={async () => {
              await saveAttempt({
                contentId: content.id,
                mode: 'silent',
                locale: answerLocale,
                durationMs: 0,
              });
            }}
            onDeleteAttempt={deleteAttempt}
            onToggleStar={toggleStarred}
            onGrade={async (confidence) => {
              const attempt = latestAttemptSince(item.startedAt);
              await grade(content.id, confidence, Boolean(attempt));
              finishItem(
                confidence,
                attempt?.mode ?? null,
                attempt?.durationMs ?? 0,
                attempt?.id ?? null,
              );
            }}
            onSaveWritten={async (answer) => {
              await saveAttempt({
                contentId: content.id,
                mode: 'written',
                locale: answerLocale,
                durationMs: 0,
                writtenAnswer: answer,
              });
            }}
            onResult={async ({ right, total }) => {
              if (item.status === 'done') return;
              const attempt = await saveAttempt({
                contentId: content.id,
                mode: 'selection',
                locale: answerLocale,
                durationMs: 0,
              });
              // Graded from the answers themselves. Asking somebody to rate
              // how well they knew something the app just marked would be
              // theatre, and a worse signal than what they actually answered.
              const confidence: Confidence =
                right === total ? 'known' : right * 2 >= total ? 'partial' : 'unknown';
              await grade(content.id, confidence, true);
              finishItem(confidence, 'selection', 0, attempt.id);
            }}
            onRevealWithoutAttempt={() => markRevealedWithoutAttempt(content.id)}
            getRecordingUrl={getRecordingUrl}
            sourceById={sourceById}
            contentById={index.byId}
            onNavigate={() => undefined}
          />
        </div>
      </main>

      {/* --- the way forward ---------------------------------------------- */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-booth/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[52rem] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <p className="min-w-0 flex-1 text-meta text-legend-3" aria-live="polite">
            {itemDone ? (
              <span className="inline-flex items-center gap-1.5 text-legend-2">
                <LuCheck aria-hidden="true" className="text-monitor" />
                {t('practice.itemDone')}
              </span>
            ) : (
              <span className="hidden sm:inline">{t('practice.gradeToContinue')}</span>
            )}
          </p>

          {!itemDone ? (
            <TransportButton variant="quiet" size="sm" onClick={skip}>
              {t('practice.skip')}
            </TransportButton>
          ) : null}

          <TransportButton
            ref={nextRef}
            variant="neutral"
            size="lg"
            disabled={!itemDone}
            icon={isLast ? <LuCheck /> : <LuArrowRight />}
            onClick={advance}
          >
            {isLast ? t('practice.finish') : t('practice.next')}
          </TransportButton>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const KIND_ICON: Record<PracticeKind, React.ReactNode> = {
  speaking: <LuMic />,
  technical: <LuWrench />,
  'code-reading': <LuCode />,
  architecture: <LuBlocks />,
  security: <LuShieldCheck />,
  behavioral: <LuUsers />,
  english: <LuLanguages />,
  review: <LuRotateCcw />,
};

function PracticeSummary({ session }: { session: PracticeSession }) {
  const { index } = useStudy();
  const { t, text } = useI18n();
  const navigate = useNavigate();

  const summary = useMemo(() => summariseSession(session, index.byId), [session, index.byId]);
  const recommendations = useMemo(() => recommendAfterSession(session, index), [session, index]);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-[52rem] items-center gap-3 px-4">
          <Mark size={20} />
          <span className="legend-type">{t(sessionName(session.size))}</span>
          <TransportButton
            className="ml-auto"
            variant="quiet"
            size="sm"
            icon={<LuX />}
            onClick={() => navigate('/')}
          >
            {t('action.close')}
          </TransportButton>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[52rem] space-y-6 px-4 py-8">
        <div className="space-y-2">
          <h1 className="flex flex-wrap items-baseline gap-x-4 text-deck font-semibold tracking-[-0.025em] text-legend">
            {session.endedEarly ? t('practice.complete.ended') : t('practice.complete.title')}
            <span
              data-tabular
              className="font-mono text-prompt font-normal tabular-nums text-legend-2"
            >
              {summary.completed} / {summary.total}
            </span>
          </h1>
          <p className="text-meta text-legend-3">
            {t('practice.summary.time')}: ~{summary.minutes} min ·{' '}
            {t('practice.summary.recordings')}: <span data-tabular>{summary.recordings}</span>
          </p>
        </div>

        <Panel className="animate-tape-engage overflow-hidden" aria-labelledby="summary-session">
          <PanelHeader legend={t('practice.summary.session')} headingId="summary-session" />
          <PanelRule />
          <div className="p-1.5">
            <ChannelStrip
              compact
              name={t('practice.summary.completed')}
              value={summary.total ? summary.completed / summary.total : 0}
              tone="brass"
              badge={`${summary.completed}/${summary.total}`}
            />
            <ChannelStrip
              compact
              name={t('practice.summary.knew')}
              value={summary.completed ? summary.knew / summary.completed : 0}
              tone="monitor"
              badge={`${summary.knew}/${summary.completed}`}
            />
          </div>

          {summary.kinds.length > 0 ? (
            <>
              <PanelRule />
              <ul>
                {summary.kinds.map(({ kind, count }) => (
                  <li
                    key={kind}
                    className="flex items-center gap-3 border-t border-rule/60 px-4 py-2.5 first:border-t-0"
                  >
                    <span aria-hidden="true" className="text-[1.1em] text-legend-3">
                      {KIND_ICON[kind]}
                    </span>
                    <span className="text-body text-legend-2">{t(`kind.${kind}`)}</span>
                    <span
                      data-tabular
                      className="ml-auto font-mono text-meta tabular-nums text-legend-2"
                    >
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {summary.categoryIds.length > 0 ? (
            <div className="border-t border-rule bg-felt px-4 py-3">
              <p className="legend-type mb-1.5">{t('practice.summary.categories')}</p>
              <p className="text-meta text-legend-2">
                {summary.categoryIds
                  .map((id) => text(CATEGORIES.find((category) => category.id === id)?.label))
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ) : null}
        </Panel>

        <Panel className="overflow-hidden" aria-labelledby="summary-review">
          <PanelHeader legend={t('practice.summary.needsReview')} headingId="summary-review" />
          <PanelRule />
          {summary.needsReview.length === 0 ? (
            <p className="px-4 py-5 text-body text-legend-3">
              {t('practice.summary.needsReview.none')}
            </p>
          ) : (
            <ul>
              {summary.needsReview.map((contentId) => {
                const content = index.byId.get(contentId);
                if (!content) return null;
                return (
                  <li key={contentId}>
                    <Link
                      to={`/content/${content.slug}`}
                      className="group flex items-center gap-3 border-t border-rule/60 px-4 py-3 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                    >
                      <Lamp tone="brass" />
                      <span className="min-w-0 flex-1 truncate text-body text-legend">
                        {text(content.title)}
                      </span>
                      <LuArrowRight
                        aria-hidden="true"
                        className="shrink-0 text-legend-3 group-hover:text-legend"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className="overflow-hidden" aria-labelledby="summary-next">
          <PanelHeader legend={t('practice.rec.title')} headingId="summary-next" />
          <PanelRule />
          {recommendations.length === 0 ? (
            <p className="max-w-read px-4 py-5 text-body text-legend-3">{t('practice.rec.none')}</p>
          ) : (
            <ul>
              {recommendations.map((recommendation, position) => (
                <li
                  key={position}
                  className="space-y-2.5 border-t border-rule/60 px-4 py-4 first:border-t-0"
                >
                  {recommendation.kind === 'struggled' ? (
                    <>
                      <p className="max-w-read text-body text-legend-2">
                        {t('practice.rec.struggled', {
                          title: text(index.byId.get(recommendation.contentId)?.title),
                          count: recommendation.relatedIds.length,
                        })}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {recommendation.relatedIds.map((id) => {
                          const related = index.byId.get(id);
                          return related ? (
                            <li key={id}>
                              <Link
                                to={`/content/${related.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-control border border-rule-strong bg-plate px-2.5 py-1.5 text-meta text-legend-2 transition-colors hover:border-legend-3 hover:text-legend"
                              >
                                {text(related.title)}
                              </Link>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </>
                  ) : recommendation.kind === 'english-short' ? (
                    <p className="max-w-read text-body text-legend-2">
                      {t('practice.rec.english', { percent: recommendation.percentOfUsual })}{' '}
                      <Link
                        to="/english"
                        className="text-legend underline decoration-rule-strong underline-offset-4"
                      >
                        {t('nav.english')}
                      </Link>
                    </p>
                  ) : (
                    <p className="max-w-read text-body text-legend-2">
                      {t('practice.rec.push')}{' '}
                      <Link
                        to="/practice"
                        className="text-legend underline decoration-rule-strong underline-offset-4"
                      >
                        {t('practice.prefs.title')}
                      </Link>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* A real ending: home or progress. No "one more session". */}
        <div className={cn('flex flex-wrap gap-2 pt-2')}>
          <TransportButton variant="neutral" size="lg" onClick={() => navigate('/')}>
            {t('practice.backHome')}
          </TransportButton>
          <TransportButton variant="quiet" size="lg" onClick={() => navigate('/progress')}>
            {t('practice.seeProgress')}
          </TransportButton>
        </div>
      </main>
    </div>
  );
}
