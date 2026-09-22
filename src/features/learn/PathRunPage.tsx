import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LuArrowLeft, LuArrowRight, LuCheck, LuX } from 'react-icons/lu';
import type { Confidence, Locale } from '@/domain/types';
import { pathProgress, stepDone } from '@/domain/paths';
import { attemptsFor } from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { Panel } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState } from '@/components/ui/States';
import { Mark } from '@/components/brand/Wordmark';
import { ContentRenderer } from '@/features/content/ContentRenderer';
import { SessionRail } from '@/features/practice/PracticeParts';
import type { RecordedTake } from '@/hooks/useRecorder';

/**
 * A path, run as a path.
 *
 * The itinerary on `/learn/:slug` says what the steps are; this is walking
 * them. It borrows the practice session's chrome — where you are, one way
 * forward, one way out — because the problem is the same one: finishing a step
 * used to leave the user on a dead-end page, having to go back to the list and
 * work out by hand what came next.
 *
 * The step lives in the URL, so browser back is the previous step, a link into
 * the middle of a path works, and a reload keeps its place.
 */
export function PathRunPage() {
  const { slug, step } = useParams<{ slug: string; step: string }>();
  const navigate = useNavigate();
  const { t, text } = useI18n();
  const { answerLocale } = useSettings();
  const {
    ready,
    index,
    snapshot,
    paths: catalogue,
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

  const path = slug ? catalogue.find((entry) => entry.slug === slug) : undefined;
  const progress = useMemo(
    () => (path ? pathProgress(path, index.byId, snapshot.progress) : null),
    [path, index.byId, snapshot.progress],
  );

  const requested = Number.parseInt(step ?? '1', 10);
  const total = progress?.total ?? 0;
  const position = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), total || 1) : 1;
  const current = progress?.steps[position - 1] ?? null;
  const content = current?.content ?? null;

  const nextRef = useRef<HTMLButtonElement | null>(null);
  const done = stepDone(content ? snapshot.progress[content.id] : undefined);

  // A step arrives at the top of itself, and the way onwards takes focus as
  // soon as it is earned — a keyboard never has to hunt for the footer.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [position]);

  useEffect(() => {
    if (done) nextRef.current?.focus({ preventScroll: true });
  }, [done]);

  const attempts = useMemo(() => (content ? attemptsFor(index, content.id) : []), [index, content]);

  const goTo = useCallback(
    (next: number) => navigate(`/learn/${slug}/step/${next}`),
    [navigate, slug],
  );

  const handleSaveTake = useCallback(
    async (take: RecordedTake, locale: Locale) => {
      if (!content) return;
      await saveAttempt({
        contentId: content.id,
        mode: 'spoken',
        locale,
        durationMs: take.durationMs,
        blob: take.blob,
        peaks: take.peaks,
      });
    },
    [content, saveAttempt],
  );

  const handleSilent = useCallback(async () => {
    if (!content) return;
    await saveAttempt({
      contentId: content.id,
      mode: 'silent',
      locale: answerLocale,
      durationMs: 0,
    });
  }, [content, saveAttempt, answerLocale]);

  const handleWritten = useCallback(
    async (answer: string) => {
      if (!content) return;
      await saveAttempt({
        contentId: content.id,
        mode: 'written',
        locale: answerLocale,
        durationMs: 0,
        writtenAnswer: answer,
      });
    },
    [content, saveAttempt, answerLocale],
  );

  const handleResult = useCallback(
    async ({ right, total: asked }: { right: number; total: number }) => {
      if (!content) return;
      await saveAttempt({
        contentId: content.id,
        mode: 'selection',
        locale: answerLocale,
        durationMs: 0,
      });
      const confidence: Confidence =
        right === asked ? 'known' : right * 2 >= asked ? 'partial' : 'unknown';
      await grade(content.id, confidence, true);
    },
    [content, saveAttempt, grade, answerLocale],
  );

  const handleGrade = useCallback(
    async (confidence: Confidence) => {
      if (!content) return;
      await grade(content.id, confidence, attempts.length > 0);
    },
    [content, grade, attempts.length],
  );

  if (!ready) return <BoothLoading label={t('loading.activity')} />;

  if (!path || !progress || progress.total === 0) {
    return (
      <div className="mx-auto max-w-read px-4 py-16">
        <Panel>
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
      </div>
    );
  }

  // A step number outside the path is a typo, or a path that changed shape:
  // land on the nearest real step rather than on an error.
  if (position !== requested) return <Navigate to={`/learn/${slug}/step/${position}`} replace />;
  if (!content) return <Navigate to={`/learn/${slug}`} replace />;

  const isLast = position >= progress.total;

  return (
    <div className="min-h-dvh">
      {/* --- where you are, and the way out -------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-rule bg-booth/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[52rem] items-center gap-3 px-4">
          <Mark size={20} />
          <span className="legend-type hidden min-w-0 truncate sm:inline">{text(path.title)}</span>
          <span
            data-tabular
            className="whitespace-nowrap font-mono text-body tabular-nums text-legend"
          >
            {position} / {progress.total}
          </span>
          <TransportButton
            className="ml-auto"
            variant="quiet"
            size="sm"
            icon={<LuX />}
            title={t('path.exit.saved')}
            aria-label={t('path.exit')}
            onClick={() => navigate(`/learn/${slug}`)}
          >
            <span className="hidden whitespace-nowrap sm:inline">{t('path.exit')}</span>
          </TransportButton>
        </div>
        <div className="mx-auto max-w-[52rem] px-4 pb-2.5">
          <SessionRail
            label={t('path.stepOf', { current: position, total: progress.total })}
            items={progress.steps.map((entry) => ({
              status: entry.done ? ('done' as const) : ('pending' as const),
            }))}
            position={position - 1}
          />
        </div>
      </header>

      {/* --- the step ------------------------------------------------------ */}
      <main id="main" className="mx-auto max-w-[52rem] px-4 pb-40 pt-6">
        <div key={content.id} className="animate-tape-engage">
          <ContentRenderer
            content={content}
            attempts={attempts}
            answerLocale={answerLocale}
            isFavorite={index.favorites.has(content.id)}
            maxRecordingMs={entitlements.maxRecordingMs}
            onToggleFavorite={() => toggleFavorite(content.id)}
            onSaveTake={handleSaveTake}
            onSilentAttempt={handleSilent}
            onDeleteAttempt={deleteAttempt}
            onToggleStar={toggleStarred}
            onGrade={handleGrade}
            onSaveWritten={handleWritten}
            onResult={(result) => void handleResult(result)}
            onRevealWithoutAttempt={() => markRevealedWithoutAttempt(content.id)}
            getRecordingUrl={getRecordingUrl}
            sourceById={sourceById}
            contentById={index.byId}
            /* Related items are a way out of the path. The path already has a
               way onwards, and it is the footer. */
            hideRelated
            onNavigate={() => undefined}
          />
        </div>
      </main>

      {/* --- the way forward ----------------------------------------------- */}
      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-booth/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[52rem] items-center gap-x-3 px-4 py-3">
          {/* md, not sm: on a phone this collapses to its icon, and going
              back a step is a control you aim at, not a footnote. */}
          <TransportButton
            variant="quiet"
            size="md"
            icon={<LuArrowLeft />}
            disabled={position <= 1}
            aria-label={t('path.prev')}
            onClick={() => goTo(position - 1)}
          >
            <span className="hidden sm:inline">{t('path.prev')}</span>
          </TransportButton>

          <p className="min-w-0 flex-1 text-meta text-legend-3" aria-live="polite">
            {done ? (
              <span className="inline-flex items-center gap-1.5 text-legend-2">
                <LuCheck aria-hidden="true" className="text-monitor" />
                {t('path.stepDoneNow')}
              </span>
            ) : (
              <span className="hidden sm:inline">{t('path.stepHint')}</span>
            )}
          </p>

          {/* Never disabled: a step somebody cannot finish must still not trap
              them. It only lights up once the step is actually done. */}
          <TransportButton
            ref={nextRef}
            variant={done ? 'primary' : 'neutral'}
            size="lg"
            icon={isLast ? <LuCheck /> : <LuArrowRight />}
            onClick={() => (isLast ? navigate(`/learn/${slug}`) : goTo(position + 1))}
          >
            {isLast ? t('path.finish') : t('path.next')}
          </TransportButton>
        </div>
      </footer>
    </div>
  );
}

export { PathRunPage as default };
