'use client';

import { AuthSessionMonitor } from '@/core/components/AuthSessionMonitor';
import { AuthStoreSync } from '@/core/components/AuthStoreSync';
import { SessionAuthBridge } from '@/core/components/SessionAuthBridge';
import '@/core/config/zodJitless';
import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { createQueryClient } from '@/core/config/api/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { CompatibleStyleWrapper } from './CompatibleStyleWrapper';

import { ErrorBoundary } from '@/core/components/ErrorBoundary';
import '@/core/config/AceEditor/init';
import { IconHome } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

const client = createQueryClient();
export const ClientContext = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <ErrorBoundary
      action={
        <Button
          className="mt-6"
          icon={<IconHome />}
          onClick={() => router.push('/')}
        >
          Home
        </Button>
      }
    >
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
