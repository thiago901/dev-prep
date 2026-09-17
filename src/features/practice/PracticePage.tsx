import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { STACKS } from '@/data/seed/taxonomy';
import {
  PRACTICE_FOCUSES,
  PRACTICE_SIZES,
  sessionProgress,
  type PracticeDifficulty,
  type PracticePreferences,
  type PracticeSize,
} from '@/domain/practice';
import { useStudy } from '@/app/providers/StudyProvider';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Legend, Panel, PanelHeader, PanelRule } from '@/components/lab/Panel';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton, TwoPositionSwitch } from '@/components/lab/Transport';
import { BoothLoading } from '@/components/ui/States';
import { renderInline } from '@/features/content/blocks/Prose';
import { PlanMeta, SessionRail, WhyTheseActivities, sessionName } from './PracticeParts';

const DIFFICULTIES: PracticeDifficulty[] = ['mixed', 'comfortable', 'challenging', 'hard'];

/**
 * The practice desk.
 *
 * Starting must take one press: the daily goal is pre-selected, the plan is
 * already built and explained. Everything else on this screen — other sizes,
 * preferences — is there for the days the default is wrong, not a decision the
 * user has to make every time.
 */
export function PracticePage() {
  const {
    ready,
    index,
    todaySession,
    practicePreferences,
    savePracticePreferences,
    planPractice,
    startPractice,
  } = useStudy();
  const { t, text } = useI18n();
  const navigate = useNavigate();
  const [starting, setStarting] = useState<PracticeSize | null>(null);

  const plans = useMemo(
    () => Object.fromEntries(PRACTICE_SIZES.map((size) => [size, planPractice(size)])) as Record<
      PracticeSize,
      ReturnType<typeof planPractice>
    >,
    [planPractice],
  );

  if (!ready) return <BoothLoading label={t('common.loading')} />;

  const active = todaySession && !sessionProgress(todaySession, index.byId).complete && !todaySession.endedEarly
    ? todaySession
    : null;
  const activeProgress = active ? sessionProgress(active, index.byId) : null;
  const activeNext = active?.items.find((item) => item.status === 'pending');
  const activeNextContent = activeNext ? index.byId.get(activeNext.contentId) : undefined;

  const goal = practicePreferences.dailyGoal;

  const start = async (size: PracticeSize) => {
    setStarting(size);
    try {
      const session = await startPractice(size);
      if (session) navigate('/practice/session');
    } finally {
      setStarting(null);
    }
  };

  const updatePreferences = (patch: Partial<PracticePreferences>) =>
    void savePracticePreferences({ ...practicePreferences, ...patch });

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  return (
    <div className="mx-auto max-w-[52rem] space-y-6">
      <div className="space-y-2">
        <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">{t('practice.title')}</h1>
        <p className="max-w-read text-body text-legend-3">{t('practice.subtitle')}</p>
      </div>

      {/* --- a session already under way always comes first ---------------- */}
      {active && activeProgress ? (
        <Panel className="overflow-hidden" aria-labelledby="practice-active">
          <PanelHeader
            legend={t(sessionName(active.size))}
            headingId="practice-active"
            actions={
              <span data-tabular className="font-mono text-meta tabular-nums text-legend-2">
                {activeProgress.done} / {activeProgress.total}
              </span>
            }
          />
          <div className="px-4 pb-4">
            <SessionRail
              items={active.items}
              label={t('practice.progress', { done: activeProgress.done, total: activeProgress.total })}
            />
          </div>
          <PanelRule />
          {activeNextContent ? (
            <div className="px-4 py-4">
              <p className="max-w-read text-prompt font-medium leading-snug text-legend">
                {renderInline(text(activeNextContent.title))}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 border-t border-rule bg-felt px-4 py-3">
            <TransportButton variant="neutral" size="lg" icon={<LuArrowRight />} onClick={() => navigate('/practice/session')}>
              {t('practice.continue')}
            </TransportButton>
            <span className="text-meta text-legend-3">
              {t('practice.remaining', { minutes: activeProgress.remainingMinutes })}
            </span>
          </div>
        </Panel>
      ) : null}

      {/* --- sizes: a selector list, the daily goal marked --------------- */}
      <Panel className="overflow-hidden" aria-labelledby="practice-sizes">
        <PanelHeader legend={t('practice.sessions')} headingId="practice-sizes" />
        <PanelRule />
        <ul>
          {PRACTICE_SIZES.map((size) => {
            const plan = plans[size];
            const isGoal = size === goal;
            return (
              <li key={size} className="border-t border-rule/60 first:border-t-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-body font-medium text-legend">{t(sessionName(size))}</span>
                      {isGoal ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Lamp tone="brass" />
                          <span className="legend-type">{t('practice.dailyGoal')}</span>
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block">
                      <PlanMeta contents={plan.map((entry) => entry.content)} size={plan.length} />
                    </span>
                  </span>
                  <TransportButton
                    variant="neutral"
                    icon={<LuArrowRight />}
                    disabled={plan.length === 0 || starting !== null}
                    onClick={() => void start(size)}
                  >
                    {starting === size ? t('common.loading') : t('practice.start')}
                  </TransportButton>
                </div>
                {isGoal && plan.length > 0 ? (
                  <div className="border-t border-rule/60 bg-felt px-4 py-3">
                    <WhyTheseActivities plan={plan} />
                  </div>
                ) : null}
                {plan.length === 0 ? (
                  <p className="px-4 pb-3 text-meta text-legend-3">{t('practice.empty')}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Panel>

      {/* --- preferences, saved as they change ---------------------------- */}
      <Panel className="overflow-hidden" aria-labelledby="practice-prefs">
        <PanelHeader legend={t('practice.prefs.title')} headingId="practice-prefs" />
        <PanelRule />
        <div className="space-y-5 p-4">
          <Field label={t('practice.prefs.goal')}>
            <TwoPositionSwitch
              label={t('practice.prefs.goal')}
              value={String(goal)}
              onChange={(value) => updatePreferences({ dailyGoal: Number(value) as PracticeSize })}
              optionClassName="inline-flex min-h-11 min-w-11 items-center justify-center"
              options={PRACTICE_SIZES.map((size) => ({ value: String(size), label: String(size) }))}
            />
          </Field>

          <Field label={t('practice.prefs.focus')} help={t('practice.prefs.focus.help')}>
            <div className="flex flex-wrap gap-1.5">
              {PRACTICE_FOCUSES.map((focus) => (
                <Chip
                  key={focus}
                  active={practicePreferences.focus.includes(focus)}
                  onClick={() => updatePreferences({ focus: toggle(practicePreferences.focus, focus) })}
                >
                  {t(`focus.${focus}`)}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={t('practice.prefs.difficulty')}>
            <TwoPositionSwitch
              label={t('practice.prefs.difficulty')}
              value={practicePreferences.difficulty}
              onChange={(difficulty) => updatePreferences({ difficulty })}
              className="grid grid-cols-2 sm:inline-flex"
              optionClassName="inline-flex min-h-11 items-center justify-center"
              options={DIFFICULTIES.map((difficulty) => ({ value: difficulty, label: t(`pdiff.${difficulty}`) }))}
            />
          </Field>

          <Field label={t('practice.prefs.stacks')}>
            <div className="flex flex-wrap gap-1.5">
              {STACKS.map((stack) => (
                <Chip
                  key={stack.id}
                  active={practicePreferences.stackIds.includes(stack.id)}
                  onClick={() => updatePreferences({ stackIds: toggle(practicePreferences.stackIds, stack.id) })}
                >
                  {stack.label}
                </Chip>
              ))}
            </div>
          </Field>
        </div>
      </Panel>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <Legend as="p">{label}</Legend>
      <div>{children}</div>
      {help ? <p className="max-w-read text-meta text-legend-3">{help}</p> : null}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-control border px-2.5 py-1.5 text-meta transition-all duration-150 ease-engage active:translate-y-px',
        active
          ? 'border-brass/50 bg-brass/[0.12] text-brass shadow-pressed'
          : 'border-rule-strong bg-plate text-legend-2 hover:border-legend-3 hover:text-legend',
      )}
    >
      {children}
    </button>
  );
}
