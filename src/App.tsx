import { HeroUIProvider } from '@heroui/react';
import { BrowserRouter, useHref, useNavigate } from 'react-router-dom';
import { SettingsProvider } from '@/app/providers/SettingsProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { StudyProvider } from '@/app/providers/StudyProvider';
import { AppRoutes } from '@/app/router';

/**
 * HeroUI needs the router's navigation so its own link-like components stay
 * client-side. Keeping it inside the router is why this is a separate
 * component rather than part of App.
 */
function Providers() {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <SettingsProvider>
        <AuthProvider>
          <StudyProvider>
            <AppRoutes />
          </StudyProvider>
        </AuthProvider>
      </SettingsProvider>
    </HeroUIProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers />
    </BrowserRouter>
  );
}
