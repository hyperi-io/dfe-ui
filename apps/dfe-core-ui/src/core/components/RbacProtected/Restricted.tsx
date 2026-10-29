import { useContext } from 'react';

import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { IconInfoCircle, IconLock } from '@repo/dfe-icons';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import type { UI_DISPLAY_ACTIONS_TYPE } from './hooks/rbac.constants';
import { useRbac } from './hooks/useRbac';
import { RbacProtectedContext } from './RbacProtected';

const RESTRICTED_REASON = 'Insufficient role permissions';

interface TooltipProps extends AbstractTooltipProps {
  show?: boolean;
  triggerComponent?: React.ReactNode;
  showIcon?: boolean;
}
interface RestrictedProps {
  children: React.ReactNode;
  tooltip?: TooltipProps;
  className?: string;
  /** Render nothing for a user holding none of these, so a page they cannot read shows no disabled controls. */
  visibleTo?: UI_DISPLAY_ACTIONS_TYPE | UI_DISPLAY_ACTIONS_TYPE[];
}
export const Restricted = ({
  children,
  tooltip = { show: false },
  className,
  visibleTo = [],
}: RestrictedProps) => {
  const { isAuthorized, isLoading, isError } = useContext(RbacProtectedContext);
  const visibility = useRbac({ action: visibleTo });
  const hidden =
    (!Array.isArray(visibleTo) || visibleTo.length > 0) &&
    !visibility.isAuthorized;

  if (isLoading || isError || hidden) return null;

  if (!isAuthorized && !tooltip) return children;

  return !isAuthorized ? (
    <div
      className={cn(
        'relative opacity-50 h-full flex items-center justify-center',
        className,
      )}
    >
      {tooltip.show && (
        <Tooltip
          destroyOnHidden
          className="absolute"
          color="gray"
          // Focus opens it too, so a keyboard user reaches the reason.
          trigger={['click', 'focus']}
          title={
            <div className="flex items-center gap-2 text-white">
              <IconInfoCircle /> {RESTRICTED_REASON}
            </div>
          }
          {...tooltip}
        >
          <button
            type="button"
            aria-label={RESTRICTED_REASON}
            className="absolute z-10 h-full w-full"
          >
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
