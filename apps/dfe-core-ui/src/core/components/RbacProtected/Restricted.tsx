import { useContext } from 'react';

import { IconInfoCircle } from '@repo/dfe-icons';
import { Button, Tooltip } from 'antd';
import { RbacProtectedContext } from './RbacProtected';

interface RestrictedProps {
  children: React.ReactNode;
  tooltip?: boolean;
}
export const Restricted = ({ children, tooltip = true }: RestrictedProps) => {
  const { isAuthorized, isLoading, isError } = useContext(RbacProtectedContext);

  if (isLoading || isError) return null;

  if (!isAuthorized && !tooltip) return children;

  return !isAuthorized ? (
    <Tooltip
      className="relative"
      destroyOnHidden
      color="gray"
      trigger="click"
      title={
        <>
          <IconInfoCircle className="mr-1" /> Insufficient role permissions
        </>
      }
    >
      <Button className="absolute w-full h-full z-1" type="text" />
      {children}
    </Tooltip>
  ) : null;
};
