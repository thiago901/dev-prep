import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExperienceLevel, Locale, TargetRole, UserProfile } from '@/domain/types';
import { STACKS } from '@/data/seed/taxonomy';
import { useStudy } from '@/app/providers/StudyProvider';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton, TwoPositionSwitch } from '@/components/lab/Transport';
import { BoothLoading } from '@/components/ui/States';

const ROLES: TargetRole[] = ['backend', 'frontend', 'fullstack', 'software-engineer', 'tech-lead'];
const LEVELS: ExperienceLevel[] = ['mid', 'senior', 'staff'];

/** Profile and preferences. Everything saves as you change it. */
export function ProfilePage() {
  const { ready, snapshot, saveProfile, clearEverything } = useStudy();
  const { locale, setLocale, answerLocale, setAnswerLocale, theme, setTheme } = useSettings();
  const { user, available, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setDraft(
      snapshot.profile ?? {
        uid: user?.uid ?? 'local',
        displayName: user?.displayName ?? '',
        email: user?.email ?? null,
        photoURL: user?.photoURL ?? null,
        targetRole: null,
        level: null,
        stackIds: [],
        interviewLocales: ['en'],
        goal: '',
        createdAt: new Date().toISOString(),
      },
    );
  }, [ready, snapshot.profile, user]);

  if (!ready || !draft) return <BoothLoading label={t('common.loading')} />;

  const update = (patch: Partial<UserProfile>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    void saveProfile(next);
  };

  const toggleStack = (stackId: string) => {
    update({
      stackIds: draft.stackIds.includes(stackId)
        ? draft.stackIds.filter((id) => id !== stackId)
        : [...draft.stackIds, stackId],
    });
  };

  return (
    <div className="mx-auto max-w-[44rem] space-y-6">
      <h1 className="text-deck font-semibold tracking-[-0.025em] text-legend">
        {t('profile.title')}
      </h1>

      <Panel className="overflow-hidden">
        <div className="space-y-5 p-4">
          <Field label={t('profile.name')}>
            <input
              type="text"
              value={draft.displayName}
              onChange={(event) => update({ displayName: event.target.value })}
              placeholder={t('profile.namePlaceholder')}
              className="recess h-11 w-full px-3 text-body text-legend outline-none"
            />
          </Field>

          <Field label={t('profile.targetRole')}>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => (
                <Chip
                  key={role}
                  active={draft.targetRole === role}
                  onClick={() => update({ targetRole: draft.targetRole === role ? null : role })}
                >
                  {t(`role.${role}`)}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={t('profile.level')}>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((level) => (
                <Chip
                  key={level}
                  active={draft.level === level}
                  onClick={() => update({ level: draft.level === level ? null : level })}
                >
                  {t(`level.${level}`)}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={t('profile.stacks')}>
            <div className="flex flex-wrap gap-1.5">
              {STACKS.map((stack) => (
                <Chip
                  key={stack.id}
                  active={draft.stackIds.includes(stack.id)}
                  onClick={() => toggleStack(stack.id)}
                >
                  {stack.label}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={t('profile.goal')} help={t('profile.goalHelp')}>
            <input
              type="text"
              value={draft.goal}
              onChange={(event) => update({ goal: event.target.value })}
              placeholder={t('profile.goalPlaceholder')}
              className="recess h-11 w-full px-3 text-body text-legend outline-none"
            />
          </Field>
        </div>
      </Panel>

      {/* --- preferences ---------------------------------------------------- */}
      <Panel className="overflow-hidden">
        <div className="space-y-5 p-4">
          <Field label={t('settings.uiLanguage')}>
            <TwoPositionSwitch
              label={t('settings.uiLanguage')}
              value={locale}
              onChange={setLocale}
              options={[
                { value: 'pt' as Locale, label: 'Português' },
                { value: 'en' as Locale, label: 'English' },
              ]}
            />
          </Field>

          <Field label={t('settings.answerLanguage')} help={t('settings.answerLanguage.help')}>
            <TwoPositionSwitch
              label={t('settings.answerLanguage')}
              value={answerLocale}
              onChange={setAnswerLocale}
              options={[
                { value: 'pt' as Locale, label: 'Português' },
                { value: 'en' as Locale, label: 'English' },
              ]}
            />
          </Field>

          <Field label={t('settings.theme')}>
            <TwoPositionSwitch
              label={t('settings.theme')}
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark' as const, label: t('settings.theme.dark') },
                { value: 'light' as const, label: t('settings.theme.light') },
              ]}
            />
          </Field>
        </div>
      </Panel>

      {/* --- account -------------------------------------------------------- */}
      {available ? (
        <Panel className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-body text-legend-2">
            {user?.email ?? t('auth.guestNotice')}
          </span>
          {user ? (
            <TransportButton variant="neutral" size="sm" onClick={() => void signOut()}>
              {t('action.signOut')}
            </TransportButton>
          ) : (
            <TransportButton variant="primary" size="sm" onClick={() => navigate('/auth')}>
              {t('action.signIn')}
            </TransportButton>
          )}
        </Panel>
      ) : (
        <Panel className="px-4 py-4" tone="recess">
          <Legend className="mb-2">{t('auth.unavailable.title')}</Legend>
          <p className="max-w-read text-body text-legend-3">{t('auth.unavailable.body')}</p>
        </Panel>
      )}

      {/* --- clearing data -------------------------------------------------- */}
      <Panel className="overflow-hidden border-record/30">
        <div className="px-4 py-4">
          <Legend className="mb-2 text-record-ink">{t('profile.dangerZone')}</Legend>
          <p className="max-w-read text-body text-legend-3">{t('profile.dangerZone.body')}</p>
        </div>
        <PanelRule />
        <div className="flex flex-wrap items-center gap-2 bg-felt px-4 py-3">
          {confirmingClear ? (
            <>
              <p className="mr-auto text-meta text-legend-2">{t('profile.dangerZone.confirm')}</p>
              <TransportButton
                variant="danger"
                size="sm"
                onClick={async () => {
                  await clearEverything();
                  setConfirmingClear(false);
                }}
              >
                {t('action.delete')}
              </TransportButton>
              <TransportButton
                variant="quiet"
                size="sm"
                onClick={() => setConfirmingClear(false)}
              >
                {t('action.cancel')}
              </TransportButton>
            </>
          ) : (
            <TransportButton variant="danger" size="sm" onClick={() => setConfirmingClear(true)}>
              {t('profile.dangerZone')}
            </TransportButton>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Legend as="p">{label}</Legend>
      {children}
      {help ? <p className="max-w-read text-meta text-legend-3">{help}</p> : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-control border px-2.5 py-1.5 text-meta',
        'transition-all duration-150 ease-engage active:translate-y-px',
        active
          ? 'border-brass/50 bg-brass/[0.12] text-brass shadow-pressed'
          : 'border-rule-strong bg-plate text-legend-2 hover:border-legend-3 hover:text-legend',
      )}
    >
      {children}
    </button>
  );
}
