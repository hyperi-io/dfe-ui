import { ThemeProvider } from '@/core/contexts/ClientContext/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompatibleStyleWrapper } from './CompatibleStyleWrapper';

import '@/core/config/AceEditor/init';

const client = new QueryClient();
export const ClientContext = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <CompatibleStyleWrapper>{children}</CompatibleStyleWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
