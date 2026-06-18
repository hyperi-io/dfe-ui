import { createContext, useMemo } from 'react';
import type { UI_DISPLAY_ACTIONS_TYPE } from './hooks/rbac.constants';
import { useRbac } from './hooks/useRbac';

interface RbacProtectedProps {
  children: React.ReactNode;
  action: UI_DISPLAY_ACTIONS_TYPE;
}

export const RbacProtectedContext = createContext<{
  isAuthorized: boolean;
  isLoading: boolean;
  isError: boolean;
}>({
  isAuthorized: false,
  isLoading: true,
  isError: false,
});

export const RbacProtected = ({ action, children }: RbacProtectedProps) => {
  const { isAuthorized, isLoading, isError } = useRbac({ action });

  const contextValue = useMemo(
    () => ({
      isAuthorized,
      isLoading,
      isError,
    }),
    [isAuthorized, isLoading, isError],
  );

  return (
    <RbacProtectedContext.Provider value={contextValue}>
      {children}
    </RbacProtectedContext.Provider>
  );
};
