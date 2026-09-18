import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLoader } from 'react-icons/lu';
import { useAuth } from '@/app/providers/AuthProvider';
import { useI18n } from '@/i18n';
import { Legend, Panel, PanelRule } from '@/components/lab/Panel';
import { TransportButton } from '@/components/lab/Transport';
import { Wordmark } from '@/components/brand/Wordmark';
import { GoogleMark } from '@/components/brand/GoogleMark';

/**
 * Sign-in.
 *
 * Optional throughout: the guest path is a real, complete path, not a teaser.
 * When Firebase is not configured the page says so plainly instead of showing
 * a form that would fail on submit.
 */
export function AuthPage() {
  const { available, signInWithGoogle, signInWithEmail, signUpWithEmail, error, clearError } =
    useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signIn') await signInWithEmail(email, password);
      else await signUpWithEmail(email, password, name);
      navigate('/');
    } catch {
      // The error key is already in the provider; nothing to add here.
    } finally {
      setBusy(false);
    }
  };

  if (!available) {
    return (
      <div className="mx-auto max-w-[30rem] space-y-6 py-8">
        <Wordmark showTagline tagline={t('app.tagline')} />
        <Panel className="px-5 py-5">
          <Legend className="mb-2.5">{t('auth.unavailable.title')}</Legend>
          <p className="text-body leading-relaxed text-legend-2">{t('auth.unavailable.body')}</p>
          <TransportButton className="mt-5" variant="primary" onClick={() => navigate('/')}>
            {t('action.continue')}
          </TransportButton>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[26rem] space-y-6 py-8">
      <div className="space-y-3">
        <Wordmark />
        <h1 className="text-prompt font-semibold tracking-[-0.02em] text-legend">
          {t('auth.title')}
        </h1>
        <p className="text-body text-legend-3">{t('auth.subtitle')}</p>
      </div>

      <Panel className="overflow-hidden">
        <div className="p-4">
          {/* Google's own mark, at Google's own size, on our key. A sign-in
              button without it reads as a link to somewhere else. */}
          <button
            type="button"
            disabled={googleBusy || busy}
            onClick={() => {
              setGoogleBusy(true);
              void signInWithGoogle()
                .then(() => navigate('/'))
                .finally(() => setGoogleBusy(false));
            }}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-control border border-rule-strong bg-plate px-4 text-body text-legend shadow-raised transition-all duration-150 ease-engage hover:border-legend-3 hover:bg-chassis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 active:translate-y-px active:shadow-pressed disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {googleBusy ? (
              <LuLoader aria-hidden="true" className="animate-spin text-legend-3" />
            ) : (
              <GoogleMark />
            )}
            <span>{t('auth.google')}</span>
          </button>
        </div>

        <PanelRule />

        <form onSubmit={submit} className="space-y-4 p-4">
          {mode === 'signUp' ? (
            <label className="block space-y-2">
              <Legend as="span">{t('profile.name')}</Legend>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="recess h-11 w-full px-3 text-body text-legend outline-none"
              />
            </label>
          ) : null}

          <label className="block space-y-2">
            <Legend as="span">{t('auth.email')}</Legend>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError();
              }}
              autoComplete="email"
              className="recess h-11 w-full px-3 text-body text-legend outline-none"
            />
          </label>

          <label className="block space-y-2">
            <Legend as="span">{t('auth.password')}</Legend>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError();
              }}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              className="recess h-11 w-full px-3 text-body text-legend outline-none"
            />
          </label>

          {error ? (
            <p
              role="alert"
              className="rounded-control border border-record/35 bg-record/[0.07] px-3 py-2.5 text-meta text-legend-2"
            >
              {t(error)}
            </p>
          ) : null}

          <TransportButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            icon={busy ? <LuLoader className="animate-spin" /> : undefined}
          >
            {mode === 'signIn' ? t('action.signIn') : t('auth.signUp')}
          </TransportButton>
        </form>

        <PanelRule />

        <div className="flex flex-wrap items-center gap-2 bg-felt px-4 py-3">
          <TransportButton
            variant="quiet"
            size="sm"
            onClick={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              clearError();
            }}
          >
            {mode === 'signIn' ? t('auth.noAccount') : t('auth.haveAccount')}
          </TransportButton>

          <TransportButton
            className="ml-auto"
            variant="quiet"
            size="sm"
            onClick={() => navigate('/')}
          >
            {t('auth.guestContinue')}
          </TransportButton>
        </div>
      </Panel>

      <p className="text-meta leading-relaxed text-legend-3">{t('auth.guestNotice')}</p>
    </div>
  );
}
