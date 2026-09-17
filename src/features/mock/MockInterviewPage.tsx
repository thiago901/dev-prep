import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowRight, LuLock } from 'react-icons/lu';
import type { Content, LocalizedText, MockBlueprint, MockInterview } from '@/domain/types';
import { MOCK_BLUEPRINTS, SKILLS } from '@/data/seed/taxonomy';
import { composeMockInterview, summariseMock } from '@/domain/mock';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useI18n } from '@/i18n';
import { createId, formatDuration, formatTotalTime } from '@/lib/utils';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton } from '@/components/lab/Transport';
import { BoothLoading, EmptyState, Tag } from '@/components/ui/States';
import { RecordingDeck } from '@/features/content/RecordingDeck';
import { BlockRenderer } from '@/features/content/blocks';
import type { RecordedTake } from '@/hooks/useRecorder';

/**
 * The mock interview.
 *
 * Questions back to back with every answer withheld until the round closes.
 * That is the whole point: in a real interview nobody hands you the model
 * answer between questions, and the discomfort of not knowing how you did is
 * the thing being rehearsed.
 */

type Phase =
  | { kind: 'choosing' }
  | { kind: 'running'; mock: MockInterview; items: RoundItem[]; position: number }
  | { kind: 'debrief'; mock: MockInterview; items: RoundItem[] };

interface RoundItem {
  content: Content;
  slotLabel: LocalizedText;
}

export function MockInterviewPage() {
  const { ready, index, entitlements, saveAttempt, saveMock, deleteAttempt, toggleStarred, getRecordingUrl } =
    useStudy();
  const { answerLocale } = useSettings();
  const { t, text, locale } = useI18n();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>({ kind: 'choosing' });

  const start = useCallback(
    (blueprint: MockBlueprint) => {
      const picked = composeMockInterview(index, blueprint);
      if (picked.length === 0) return;

      const mock: MockInterview = {
        id: createId('mock_'),
        blueprintId: blueprint.id,
        createdAt: new Date().toISOString(),
        completedAt: null,
        items: picked.map((entry) => ({
          contentId: entry.content.id,
          slotLabel: entry.slotLabel,
          attemptId: null,
          durationMs: 0,
          skipped: false,
        })),
      };

      setPhase({ kind: 'running', mock, items: picked, position: 0 });
    },
    [index],
  );

  const advance = useCallback(
    (mock: MockInterview, items: RoundItem[], position: number) => {
      if (position + 1 >= items.length) {
        const finished: MockInterview = { ...mock, completedAt: new Date().toISOString() };
        void saveMock(finished);
        setPhase({ kind: 'debrief', mock: finished, items });
      } else {
        setPhase({ kind: 'running', mock, items, position: position + 1 });
      }
    },
    [saveMock],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  // --- choosing -----------------------------------------------------------
  if (phase.kind === 'choosing') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
            {t('mock.title')}
          </h1>
          <p className="max-w-read text-body text-legend-3">{t('mock.subtitle')}</p>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3">
          {MOCK_BLUEPRINTS.map((blueprint) => (
            <li key={blueprint.id}>
              <Panel className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 px-4 py-4">
                  <Legend className="mb-2.5">{text(blueprint.label)}</Legend>
                  <p className="text-body text-legend-2">{text(blueprint.description)}</p>

                  <ol className="mt-4 space-y-2">
                    {blueprint.slots.map((slot, position) => (
                      <li
                        key={position}
                        className="flex items-baseline gap-2.5 text-meta text-legend-3"
                      >
                        <span data-tabular className="legend-type tabular-nums">
                          {String(position + 1).padStart(2, '0')}
                        </span>
                        {text(slot.label)}
                        {slot.locale === 'en' ? <Tag tone="channel2">EN</Tag> : null}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="border-t border-rule bg-felt px-4 py-3">
                  <TransportButton variant="primary" onClick={() => start(blueprint)} fullWidth>
                    {t('mock.start')}
                  </TransportButton>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // --- running ------------------------------------------------------------
  if (phase.kind === 'running') {
    const { mock, items, position } = phase;
    const current = items[position];
    const promptBlocks = current.content.blocks.filter((block) => block.phase === 'prompt');
    const attempts = index.attempts.filter(
      (attempt) => attempt.contentId === current.content.id,
    );

    const record = async (take: RecordedTake) => {
      const attempt = await saveAttempt({
        contentId: current.content.id,
        mode: 'spoken',
        locale: answerLocale,
        durationMs: take.durationMs,
        blob: take.blob,
        peaks: take.peaks,
      });

      const updated: MockInterview = {
        ...mock,
        items: mock.items.map((item, itemPosition) =>
          itemPosition === position
            ? { ...item, attemptId: attempt.id, durationMs: take.durationMs }
            : item,
        ),
      };

      setPhase({ kind: 'running', mock: updated, items, position });
    };

    const answered = Boolean(mock.items[position].attemptId);

    return (
      <div className="mx-auto max-w-[52rem] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="legend-type" data-tabular>
            {t('mock.question', { current: position + 1, total: items.length })}
          </span>
          <TransportButton
            variant="quiet"
            size="sm"
            onClick={() => {
              const finished: MockInterview = { ...mock, completedAt: new Date().toISOString() };
              void saveMock(finished);
              setPhase({ kind: 'debrief', mock: finished, items });
            }}
          >
            {t('mock.abandon')}
          </TransportButton>
        </div>

        {/* A fixed progress rail. The cells re-letter; the frame does not move. */}
        <div className="flex gap-1" aria-hidden="true">
          {items.map((item, itemPosition) => (
            <span
              key={item.content.id}
              className={
                itemPosition < position
                  ? 'h-1 flex-1 rounded-[1px] bg-brass'
                  : itemPosition === position
                    ? 'h-1 flex-1 rounded-[1px] bg-record'
                    : 'h-1 flex-1 rounded-[1px] bg-rule'
              }
            />
          ))}
        </div>

        <header className="space-y-3">
          <Legend>{text(current.slotLabel)}</Legend>
          <h1 className="max-w-read text-prompt font-medium leading-snug text-legend sm:text-prompt-lg">
            {text(current.content.title)}
          </h1>
        </header>

        <div className="space-y-6">
          {promptBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              context={{
                answerLocale,
                contentById: index.byId,
                onNavigate: () => undefined,
              }}
            />
          ))}
        </div>

        <RecordingDeck
          compact
          attempts={attempts}
          answerLocale={answerLocale}
          maxDurationMs={entitlements.maxRecordingMs}
          onSaveTake={(take) => record(take)}
          onSilentAttempt={async () => {
            await saveAttempt({
              contentId: current.content.id,
              mode: 'silent',
              locale: answerLocale,
              durationMs: 0,
            });
          }}
          onDeleteAttempt={deleteAttempt}
          onToggleStar={toggleStarred}
          getRecordingUrl={getRecordingUrl}
        />

        <Panel className="flex items-center gap-3 px-4 py-4" tone="recess">
          <LuLock aria-hidden="true" className="shrink-0 text-legend-3" />
          <p className="text-body text-legend-3">{t('mock.noAnswers')}</p>
        </Panel>

        <div className="flex flex-wrap gap-2">
          <TransportButton
            variant={answered ? 'primary' : 'neutral'}
            size="lg"
            icon={<LuArrowRight />}
            onClick={() => advance(mock, items, position)}
          >
            {position + 1 >= items.length ? t('mock.finish') : t('mock.nextQuestion')}
          </TransportButton>

          {!answered ? (
            <TransportButton
              variant="quiet"
              onClick={() => {
                const updated: MockInterview = {
                  ...mock,
                  items: mock.items.map((item, itemPosition) =>
                    itemPosition === position ? { ...item, skipped: true } : item,
                  ),
                };
                advance(updated, items, position);
              }}
            >
              {t('mock.skip')}
            </TransportButton>
          ) : null}
        </div>
      </div>
    );
  }

  // --- debrief ------------------------------------------------------------
  const { mock, items } = phase;
  const summary = summariseMock(mock, index);
  const reviewItems = summary.reviewContentIds
    .map((id) => index.byId.get(id))
    .filter((item): item is Content => Boolean(item));

  return (
    <div className="mx-auto max-w-[52rem] space-y-6">
      <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
        {t('mock.summary.title')}
      </h1>

      {summary.answered === 0 ? (
        <Panel>
          <EmptyState
            title={t('mock.summary.noneAnswered')}
            body={t('mock.subtitle')}
            action={
              <TransportButton variant="primary" onClick={() => setPhase({ kind: 'choosing' })}>
                {t('action.retry')}
              </TransportButton>
            }
          />
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <dl className="grid divide-y divide-rule sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {[
              { label: t('mock.summary.answered'), value: String(summary.answered) },
              { label: t('mock.summary.skipped'), value: String(summary.skipped) },
              { label: t('mock.summary.averageTime'), value: formatDuration(summary.averageMs) },
              { label: t('mock.summary.totalTime'), value: formatTotalTime(summary.totalMs, locale) },
            ].map((cell) => (
              <div key={cell.label} className="px-4 py-4">
                <dt className="legend-type mb-1.5">{cell.label}</dt>
                <dd
                  data-tabular
                  className="font-mono text-prompt tabular-nums text-legend"
                >
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      )}

      {summary.weakSkillIds.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="px-4 py-3">
            <Legend>{t('progress.weakest')}</Legend>
          </div>
          <PanelRule />
          <ul className="px-4 py-3">
            {summary.weakSkillIds.map((skillId) => {
              const skill = SKILLS.find((entry) => entry.id === skillId);
              if (!skill) return null;
              return (
                <li key={skillId} className="flex items-center gap-2.5 py-1.5">
                  <Lamp tone="brass" />
                  <span className="text-body text-legend-2">{text(skill.label)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

      {reviewItems.length > 0 ? (
        <Panel className="overflow-hidden">
          <div className="px-4 py-3">
            <Legend>{t('mock.summary.review')}</Legend>
            <p className="mt-1.5 text-meta text-legend-3">{t('mock.summary.reviewHelp')}</p>
          </div>
          <PanelRule />
          <ul>
            {reviewItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/content/${item.slug}`}
                  className="group flex items-center gap-3 border-t border-rule/60 px-4 py-3 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                >
                  <span className="min-w-0 flex-1 truncate text-body text-legend">
                    {text(item.title)}
                  </span>
                  <LuArrowRight
                    aria-hidden="true"
                    className="shrink-0 text-legend-3 group-hover:text-brass"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {/* Now the answers unlock: one link per question, in the order asked. */}
      <Panel className="overflow-hidden">
        <div className="px-4 py-3">
          <Legend lit>{t('reveal.action')}</Legend>
        </div>
        <PanelRule />
        <ul>
          {items.map((item, position) => {
            const record = mock.items[position];
            return (
              <li key={item.content.id}>
                <Link
                  to={`/content/${item.content.slug}`}
                  className="group flex items-center gap-3 border-t border-rule/60 px-4 py-3 transition-colors duration-150 first:border-t-0 hover:bg-plate"
                >
                  <Lamp tone={record.skipped ? 'off' : 'monitor'} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-legend">
                      {text(item.content.title)}
                    </span>
                    <span className="legend-type mt-1 block">
                      {text(item.slotLabel)}
                      {record.durationMs > 0 ? ` · ${formatDuration(record.durationMs)}` : ''}
                    </span>
                  </span>
                  <LuArrowRight
                    aria-hidden="true"
                    className="shrink-0 text-legend-3 group-hover:text-brass"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <TransportButton variant="neutral" onClick={() => setPhase({ kind: 'choosing' })}>
          {t('mock.start')}
        </TransportButton>
        <TransportButton variant="quiet" onClick={() => navigate('/progress')}>
          {t('nav.progress')}
        </TransportButton>
      </div>
    </div>
  );
}
