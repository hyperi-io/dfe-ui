'use client';

import { AuthSessionMonitor } from '@/core/components/AuthSessionMonitor';
import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { CompatibleStyleWrapper } from './CompatibleStyleWrapper';

import '@/core/config/AceEditor/init';

const client = new QueryClient();
export const ClientContext = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus>
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <CompatibleStyleWrapper>
            <AuthSessionMonitor />
            {children}
          </CompatibleStyleWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};
