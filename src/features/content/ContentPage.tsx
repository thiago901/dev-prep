import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import type { Confidence, Locale } from '@/domain/types';
import { attemptsFor } from '@/domain/selectors';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { BoothLoading, EmptyState } from '@/components/ui/States';
import { TransportButton } from '@/components/lab/Transport';
import { Panel } from '@/components/lab/Panel';
import { ContentRenderer } from './ContentRenderer';
import type { RecordedTake } from '@/hooks/useRecorder';

/** Wires one content item to the study store. All behaviour lives in the renderer. */
export function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { answerLocale } = useSettings();
  const {
    ready,
    index,
    entitlements,
    saveAttempt,
    grade,
    markRevealedWithoutAttempt,
    deleteAttempt,
    toggleStarred,
    toggleFavorite,
    getRecordingUrl,
  } = useStudy();

  const content = useMemo(
    () => index.content.find((item) => item.slug === slug || item.id === slug) ?? null,
    [index.content, slug],
  );

  const attempts = useMemo(
    () => (content ? attemptsFor(index, content.id) : []),
    [index, content],
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

  const handleGrade = useCallback(
    async (confidence: Confidence) => {
      if (!content) return;
      await grade(content.id, confidence, attempts.length > 0);
    },
    [content, grade, attempts.length],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  if (!content) {
    return (
      <Panel className="mx-auto max-w-read">
        <EmptyState
          title={t('content.notFound.title')}
          body={t('content.notFound.body')}
          action={
            <TransportButton variant="neutral" onClick={() => navigate('/library')}>
              {t('nav.library')}
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
        onClick={() => navigate(-1)}
      >
        {t('action.back')}
      </TransportButton>

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
        onRevealWithoutAttempt={() => markRevealedWithoutAttempt(content.id)}
        getRecordingUrl={getRecordingUrl}
        contentById={index.byId}
        onNavigate={(contentId) => {
          const target = index.byId.get(contentId);
          if (target) navigate(`/content/${target.slug}`);
        }}
      />
    </div>
  );
}
