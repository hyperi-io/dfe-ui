import { useContext } from 'react';

import { RbacProtectedContext } from './RbacProtected';

interface RbacErrorProps {
  children: React.ReactNode;
}
export const RbacError = ({ children }: RbacErrorProps) => {
  const { isError, isLoading } = useContext(RbacProtectedContext);

  if (!isError || isLoading) {
    return null;
  }

  return children;
};
