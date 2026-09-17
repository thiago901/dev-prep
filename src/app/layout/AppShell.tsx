import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LuActivity,
  LuBookOpen,
  LuEllipsis,
  LuFilePen,
  LuHouse,
  LuLayers,
  LuMessagesSquare,
  LuMoon,
  LuRadio,
  LuSun,
  LuTimer,
  LuUser,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { isFirebaseConfigured } from '@/data/firebase/env';
import { Wordmark } from '@/components/brand/Wordmark';
import { Lamp } from '@/components/lab/Lamp';
import { TransportButton, TwoPositionSwitch } from '@/components/lab/Transport';
import type { StringKey } from '@/i18n';

/**
 * The booth.
 *
 * A thin faceplate header carries identity and the channel controls. Below it,
 * a rail on desktop and a transport strip on mobile. The frame never reflows
 * between states — switching language or theme re-letters the cells and leaves
 * the layout exactly where it was.
 */

interface NavItem {
  to: string;
  key: StringKey;
  icon: ReactNode;
  /** Shown in the mobile transport strip. */
  primary: boolean;
}

const NAV: NavItem[] = [
  { to: '/', key: 'nav.home', icon: <LuHouse />, primary: true },
  { to: '/practice', key: 'nav.practice.today', icon: <LuRadio />, primary: true },
  { to: '/library', key: 'nav.library', icon: <LuBookOpen />, primary: true },
  { to: '/flashcards', key: 'nav.flashcards', icon: <LuLayers />, primary: false },
  { to: '/english', key: 'nav.english', icon: <LuMessagesSquare />, primary: false },
  { to: '/mock', key: 'nav.mock', icon: <LuTimer />, primary: false },
  { to: '/progress', key: 'nav.progress', icon: <LuActivity />, primary: true },
  { to: '/profile', key: 'nav.profile', icon: <LuUser />, primary: false },
];

/** Tooling rather than study; kept apart from the study destinations. */
const TOOLS: NavItem[] = [{ to: '/admin', key: 'nav.admin', icon: <LuFilePen />, primary: false }];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useSettings();
  const { user, available } = useAuth();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);


  // Moving between screens should put the reader at the top of the new one.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMoreOpen(false);
  }, [location.pathname]);

  const mobileNav = NAV.filter((item) => item.primary);

  // Practice mode is immersive: the session renders its own minimal chrome
  // (progress and a way out) and nothing else competes with the activity.
  const immersive = location.pathname.startsWith('/practice/session');
  // Everything the transport strip cannot hold. Without this, flashcards, the
  // mock interview and the profile were unreachable on a phone.
  const overflowNav = [...NAV.filter((item) => !item.primary), ...TOOLS];
  const overflowActive = overflowNav.some((item) => location.pathname.startsWith(item.to));

  if (immersive) {
    return <div className="min-h-dvh">{children}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only-focusable absolute left-4 top-4 z-50 rounded-control border border-brass bg-chassis px-4 py-2 text-body text-legend"
      >
        {t('nav.skipToContent')}
      </a>

      {/* --- faceplate header --------------------------------------------- */}
      <header className="sticky top-0 z-30 border-b border-rule bg-booth/92 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-deck items-center gap-3 px-4">
          <NavLink to="/" className="rounded-control" aria-label={t('app.name')}>
            <Wordmark />
          </NavLink>

          {!isFirebaseConfigured ? (
            // Local mode is a state of the booth, not an announcement: a lamp
            // label with its meaning available on hover and to screen readers.
            <span
              className="ml-1 hidden items-center gap-1.5 sm:inline-flex"
              title={t('common.localMode.help')}
            >
              <Lamp tone="off" />
              <span className="legend-type">{t('common.localMode')}</span>
              <span className="sr-only">{t('common.localMode.help')}</span>
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            <TwoPositionSwitch
              label={t('settings.uiLanguage')}
              value={locale}
              onChange={setLocale}
              options={[
                { value: 'pt', label: 'PT' },
                { value: 'en', label: 'EN' },
              ]}
            />

            <TransportButton
              variant="quiet"
              size="sm"
              onClick={toggleTheme}
              aria-label={t('settings.theme.toggle')}
              title={t('settings.theme.toggle')}
              icon={theme === 'dark' ? <LuSun /> : <LuMoon />}
            />

            {available ? (
              <NavLink
                to={user ? '/profile' : '/auth'}
                className="legend-type rounded-control px-2.5 py-2 text-legend-2 transition-colors hover:text-legend"
              >
                {user ? t('nav.profile') : t('action.signIn')}
              </NavLink>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-deck flex-1 gap-8 px-4 py-6 lg:py-8">
        {/* --- desktop rail ----------------------------------------------- */}
        <nav
          aria-label={t('nav.mainLabel')}
          className="hidden w-rail shrink-0 lg:block"
        >
          <ul className="sticky top-20 space-y-px">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-control px-3 py-2.5 text-body',
                      'transition-all duration-150 ease-engage',
                      isActive
                        ? 'bg-plate text-legend shadow-pressed'
                        : 'text-legend-2 hover:bg-chassis hover:text-legend',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'text-[1.15em] transition-colors',
                          isActive ? 'text-brass' : 'text-legend-3',
                        )}
                      >
                        {item.icon}
                      </span>
                      {t(item.key)}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li role="presentation" className="my-3 h-px bg-rule" />
            {TOOLS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-control px-3 py-2 text-meta',
                      'transition-all duration-150 ease-engage',
                      isActive
                        ? 'bg-plate text-legend shadow-pressed'
                        : 'text-legend-3 hover:bg-chassis hover:text-legend-2',
                    )
                  }
                >
                  <span aria-hidden="true" className="text-[1.1em]">
                    {item.icon}
                  </span>
                  {t(item.key)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      {/* --- mobile transport strip --------------------------------------- */}
      <nav
        aria-label={t('nav.mainLabel')}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-booth/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
      >
        {moreOpen ? (
          <div id="more-destinations" className="border-b border-rule bg-chassis">
            <ul className="mx-auto grid max-w-deck grid-cols-2 gap-px p-2">
              {overflowNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex h-12 items-center gap-3 rounded-control px-3 text-body transition-colors',
                        isActive ? 'bg-plate text-legend shadow-pressed' : 'text-legend-2 hover:bg-plate',
                      )
                    }
                  >
                    <span aria-hidden="true" className="text-[1.15em] text-legend-3">
                      {item.icon}
                    </span>
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <ul className="mx-auto flex max-w-deck">
          {mobileNav.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-transport flex-col items-center justify-center gap-1 px-1',
                    'transition-colors duration-150',
                    isActive ? 'text-legend' : 'text-legend-3',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn('text-[1.3em]', isActive && 'text-brass')}
                    >
                      {item.icon}
                    </span>
                    <span className="legend-type text-[0.625rem]">{t(item.key)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-expanded={moreOpen}
              aria-controls="more-destinations"
              className={cn(
                'flex h-transport w-full flex-col items-center justify-center gap-1 px-1 transition-colors duration-150',
                moreOpen || overflowActive ? 'text-legend' : 'text-legend-3',
              )}
            >
              <span aria-hidden="true" className={cn('text-[1.3em]', overflowActive && 'text-brass')}>
                <LuEllipsis />
              </span>
              <span className="legend-type text-[0.625rem]">{t('nav.more')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
