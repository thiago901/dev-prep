import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { ErrorState } from '@/components/ui/States';

/**
 * A screen-level failure boundary.
 *
 * A broken screen must not take the whole booth down, and the message has to
 * tell the user the one thing they care about: their recordings are still
 * there.
 */
class Boundary extends Component<
  { children: ReactNode; title: string; body: string; retryLabel: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept as a console report rather than swallowed: in local mode there is
    // no reporting service, and a silent failure is the worst outcome.
    console.error('DevPrep screen failed', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          title={this.props.title}
          body={this.props.body}
          retryLabel={this.props.retryLabel}
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <Boundary
      title={t('common.error.title')}
      body={t('common.error.body')}
      retryLabel={t('common.error.reload')}
    >
      {children}
    </Boundary>
  );
}
