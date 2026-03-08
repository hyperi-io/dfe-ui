import { CompatibleStyleWrapper } from './CompatibleStyleWrapper';

export const ClientContext = ({ children }: { children: React.ReactNode }) => {
  return <CompatibleStyleWrapper>{children}</CompatibleStyleWrapper>;
};
