import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from '@/App';
import { ErrorBoundary } from '@/components/AppShell/ErrorBoundary';
import { initAuthListener } from '@/auth/useAuth';
import { queryClient } from '@/queryClient';
import '@/app.css';

initAuthListener();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
