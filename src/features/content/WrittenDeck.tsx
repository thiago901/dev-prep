import { useMemo, useState } from 'react';
import { LuPenLine } from 'react-icons/lu';
import type { Attempt } from '@/domain/types';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';

/**
 * Writing your answer.
 *
 * The same gate as the recording deck, without the microphone. It exists so
 * the product can ask a real question in a quiet office, on a phone in
 * public, or from someone who simply thinks better in writing — and so that
 * the answer they gave is still on screen when the model answer appears.
 */

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function WrittenDeck({
  attempts,
  onSaveWritten,
  onSilentAttempt,
  gateSince,
  compact = false,
}: {
  attempts: Attempt[];
  onSaveWritten: (answer: string) => Promise<void>;
  /** "I just thought it through" — a real answer, just not a written one. */
  onSilentAttempt?: () => Promise<void>;
  gateSince?: string;
  /** Inside a session the deck drops its explanatory line. */
  compact?: boolean;
}) {
  const { t } = useI18n();

  const saved = useMemo(() => {
    const relevant = attempts
      .filter((attempt) => attempt.mode === 'written' && attempt.writtenAnswer)
      .filter((attempt) => (gateSince ? attempt.createdAt >= gateSince : true));
    return relevant[relevant.length - 1] ?? null;
  }, [attempts, gateSince]);

  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const showSaved = saved && !editing;
  const words = countWords(draft);

  const submit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      await onSaveWritten(draft.trim());
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="overflow-hidden" aria-label={t('write.title')}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Legend className="inline-flex items-center gap-2">
          <span aria-hidden="true">
            <LuPenLine />
          </span>
          {t('write.title')}
        </Legend>
        {showSaved ? <span className="legend-type text-monitor">{t('write.saved')}</span> : null}
      </div>
      <PanelRule />

      {showSaved ? (
        <div className="space-y-3 bg-felt px-4 py-4">
          <p className="max-w-read whitespace-pre-wrap text-body leading-relaxed text-legend-2">
            {saved.writtenAnswer}
          </p>
          <TransportButton
            variant="quiet"
            size="sm"
            onClick={() => {
              setDraft(saved.writtenAnswer ?? '');
              setEditing(true);
            }}
          >
            {t('write.rewrite')}
          </TransportButton>
        </div>
      ) : (
        <div className="bg-felt px-4 py-4">
          {!compact ? (
            <p className="mb-3 max-w-read text-body text-legend-3">{t('briefing.writing')}</p>
          ) : null}

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            aria-label={t('write.title')}
            placeholder={t('write.placeholder')}
            className="w-full resize-y rounded-control border border-rule-strong bg-chassis px-3 py-2.5 text-body leading-relaxed text-legend placeholder:text-legend-3 focus:border-legend-3 focus:outline-none focus:ring-1 focus:ring-legend-3/40"
          />

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <TransportButton
              variant="primary"
              size="lg"
              disabled={!draft.trim() || busy}
              onClick={() => void submit()}
            >
              {t('write.submit')}
            </TransportButton>
            <span className="legend-type" data-tabular>
              {t('write.count', { count: words })}
            </span>
            {onSilentAttempt ? (
              <button
                type="button"
                onClick={() => void onSilentAttempt()}
                className="ml-auto rounded-[2px] text-micro text-legend-3 underline decoration-rule-strong underline-offset-2 transition-colors hover:text-legend-2"
              >
                {t('write.thought')}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </Panel>
  );
}
