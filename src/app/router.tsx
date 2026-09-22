import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { ErrorBoundary } from './ErrorBoundary';
import { PageSkeleton } from '@/components/ui/States';
import { useI18n } from '@/i18n';
import { HomePage } from '@/features/home/HomePage';

/**
 * Routes.
 *
 * Home ships in the first chunk because it is where every session starts.
 * Everything else is split, which keeps the first paint fast on a mid-range
 * phone — the device this product is most often used on.
 */

const LibraryPage = lazy(() =>
  import('@/features/library/LibraryPage').then((module) => ({ default: module.LibraryPage })),
);
const ContentPage = lazy(() =>
  import('@/features/content/ContentPage').then((module) => ({ default: module.ContentPage })),
);
const FlashcardsPage = lazy(() =>
  import('@/features/flashcards/FlashcardsPage').then((module) => ({
    default: module.FlashcardsPage,
  })),
);
const EnglishPage = lazy(() =>
  import('@/features/english/EnglishPage').then((module) => ({ default: module.EnglishPage })),
);
const MockInterviewPage = lazy(() =>
  import('@/features/mock/MockInterviewPage').then((module) => ({
    default: module.MockInterviewPage,
  })),
);
const ProgressPage = lazy(() =>
  import('@/features/progress/ProgressPage').then((module) => ({ default: module.ProgressPage })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const AuthPage = lazy(() =>
  import('@/features/auth/AuthPage').then((module) => ({ default: module.AuthPage })),
);
const LearnPage = lazy(() =>
  import('@/features/learn/LearnPage').then((module) => ({ default: module.LearnPage })),
);
const PathRunPage = lazy(() =>
  import('@/features/learn/PathRunPage').then((module) => ({ default: module.PathRunPage })),
);
const PathPage = lazy(() =>
  import('@/features/learn/PathPage').then((module) => ({ default: module.PathPage })),
);
const SpeakingPage = lazy(() =>
  import('@/features/speaking/SpeakingPage').then((module) => ({ default: module.SpeakingPage })),
);
const PracticePage = lazy(() =>
  import('@/features/practice/PracticePage').then((module) => ({ default: module.PracticePage })),
);
const PracticeSessionPage = lazy(() =>
  import('@/features/practice/PracticeSessionPage').then((module) => ({
    default: module.PracticeSessionPage,
  })),
);
const AdminPage = lazy(() =>
  import('@/features/admin/AdminPage').then((module) => ({ default: module.AdminPage })),
);

export function AppRoutes() {
  const { t } = useI18n();

  return (
    <AppShell>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton label={t('common.loading')} />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/learn/:slug" element={<PathPage />} />
            <Route path="/learn/:slug/step/:step" element={<PathRunPage />} />
            <Route path="/speaking" element={<SpeakingPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/session" element={<PracticeSessionPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/content/:slug" element={<ContentPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/english" element={<EnglishPage />} />
            <Route path="/speaking/english" element={<Navigate to="/speaking" replace />} />
            <Route path="/mock" element={<MockInterviewPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
