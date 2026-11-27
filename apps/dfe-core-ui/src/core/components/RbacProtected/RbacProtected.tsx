import { createContext, useMemo } from 'react';
import type { UI_DISPLAY_ACTIONS_TYPE } from './hooks/rbac.constants';
import { useRbac } from './hooks/useRbac';

interface RbacProtectedProps {
  children: React.ReactNode;
  action: UI_DISPLAY_ACTIONS_TYPE | UI_DISPLAY_ACTIONS_TYPE[];
  /** With a list of actions, authorise only a user holding every one, not any one. */
  requireAll?: boolean;
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

export const RbacProtected = ({
  action,
  requireAll,
  children,
}: RbacProtectedProps) => {
  const { isAuthorized, isLoading, isError } = useRbac({ action, requireAll });

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
