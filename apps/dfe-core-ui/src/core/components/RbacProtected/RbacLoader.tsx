import { useContext } from 'react';

import { RbacProtectedContext } from './RbacProtected';

interface RbacLoaderProps {
  children: React.ReactNode;
}
export const RbacLoader = ({ children }: RbacLoaderProps) => {
  const { isLoading, isError } = useContext(RbacProtectedContext);

  if (isError || !isLoading) {
    return null;
  }

  return children;
};
