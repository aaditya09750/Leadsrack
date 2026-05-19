import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const bootstrap = useThemeStore((s) => s.bootstrap);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    bootstrap();
    hydrate();
  }, [bootstrap, hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" theme={theme} richColors />
    </QueryClientProvider>
  );
}

export default App;
