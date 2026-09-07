'use client';

import { AuthSessionMonitor } from '@/core/components/AuthSessionMonitor';
import { AuthStoreSync } from '@/core/components/AuthStoreSync';
import { SessionAuthBridge } from '@/core/components/SessionAuthBridge';
import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { CompatibleStyleWrapper } from './CompatibleStyleWrapper';

import { ErrorBoundary } from '@/core/components/ErrorBoundary';
import '@/core/config/AceEditor/init';
import { Suspense } from 'react';

const client = new QueryClient();
export const ClientContext = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <QueryClientProvider client={client}>
          <ThemeProvider>
            <CompatibleStyleWrapper>
              <SessionAuthBridge />
              <AuthStoreSync />
              {/* This provider is in the root layout, so AuthSessionMonitor's
                  useSearchParams fails the prerender of /_not-found unless it
                  sits behind Suspense. */}
              <Suspense fallback={null}>
                <AuthSessionMonitor />
              </Suspense>
              {children}
            </CompatibleStyleWrapper>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};
