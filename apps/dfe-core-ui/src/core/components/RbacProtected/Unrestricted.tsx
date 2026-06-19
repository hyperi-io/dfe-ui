import { useContext } from 'react';

import { RbacProtectedContext } from './RbacProtected';

interface UnrestrictedProps {
  children: React.ReactNode;
}
export const Unrestricted = ({ children }: UnrestrictedProps) => {
  const { isAuthorized, isLoading, isError } = useContext(RbacProtectedContext);

  if (isLoading || isError) return null;

  return isAuthorized ? children : null;
};
