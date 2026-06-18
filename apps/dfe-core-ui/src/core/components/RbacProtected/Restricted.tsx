import { useContext } from 'react';

import { IconInfoCircle, IconLock } from '@repo/dfe-icons';
import { Tooltip } from 'antd';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import { RbacProtectedContext } from './RbacProtected';

interface TooltipProps extends AbstractTooltipProps {
  show?: boolean;
  triggerComponent?: React.ReactNode;
  showIcon?: boolean;
}
interface RestrictedProps {
  children: React.ReactNode;
  tooltip?: TooltipProps;
}
export const Restricted = ({
  children,
  tooltip = { show: false },
}: RestrictedProps) => {
  const { isAuthorized, isLoading, isError } = useContext(RbacProtectedContext);

  if (isLoading || isError) return null;

  if (!isAuthorized && !tooltip) return children;

  return !isAuthorized ? (
    <div className="relative opacity-50 h-full">
      {tooltip.show && (
        <Tooltip
          destroyOnHidden
          className="absolute"
          color="gray"
          trigger="click"
          title={
            <div className="flex items-center gap-2 text-white">
              <IconInfoCircle /> Insufficient role permissions
            </div>
          }
          {...tooltip}
        >
          <button className="absolute z-10 h-full w-full">
            {tooltip.showIcon && (
              <span className="absolute left-7 top-1.5 bg-white rounded-full p-1">
                <IconLock className="text-black w-4 h-4" />
              </span>
            )}
          </button>
        </Tooltip>
      )}
      {children}
    </div>
  ) : null;
};
