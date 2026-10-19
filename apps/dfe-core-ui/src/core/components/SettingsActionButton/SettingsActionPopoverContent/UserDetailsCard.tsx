'use client';

import { NotificationCard } from '@/core/components/NotificationCard';

import { useFetchPermissions } from '@/core/hooks/_useFetchPermissions';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { useLogout } from '@/core/hooks/useLogout';
import {
  IconBuilding,
  IconLock,
  IconLogout,
  IconUser,
  IconUsers,
} from '@repo/dfe-icons';
import { Tooltip } from '@repo/dfe-shared-ui';
import { Button, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formatLimitedList = (
  items: string[],
  max: number,
  emptyLabel: string,
) => {
  if (items.length === 0) return emptyLabel;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return extra > 0 ? `${shown.join(', ')} and ${extra} more` : shown.join(', ');
};

const detailsHeadingStyle = 'text-sm flex items-center gap-2';

export const UserDetailsCard = () => {
  const router = useRouter();
  const { handleLogout } = useLogout();
  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    error: errorCurrentUser,
  } = useFetchCurrentUser();
  const currentUserEmail = currentUser?.email?.trim();
  const name = currentUser?.name?.trim() || currentUser?.username || '';
  const firstLetter = name.charAt(0);

  const {
    data: permissions,
    isLoading: isLoadingPermissions,
    error: errorPermissions,
  } = useFetchPermissions();

  if (isLoadingCurrentUser || isLoadingPermissions) {
    return (
      <>
        <Spin />
        <span className="sr-only">Loading current user details...</span>
      </>
    );
  }

  if (errorCurrentUser || errorPermissions) {
    return (
      <NotificationCard
        type="error"
        title="Error loading current user details"
        description="Please try again later."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <NotificationCard
        type="action"
        classNames={{
          container: 'w-full!',
        }}
        title={
          <div className="flex gap-4 items-center w-full">
            {firstLetter ? (
              <span className="text-xl bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                {firstLetter}
              </span>
            ) : (
              <IconUser />
            )}
            <div className="flex flex-col">
              <span className="flex items-center text-md">
                Welcome,
                <span className="font-medium ml-1">{name}</span>!
              </span>
              {currentUserEmail ? (
                <span className="text-sm text-foreground/40 dark:text-dark-foreground/40">
                  {currentUserEmail}
                </span>
              ) : null}
            </div>
          </div>
        }
        description={
          <div className="flex flex-col gap-1">
            <span className={detailsHeadingStyle}>
              <Tooltip title="Organisation">
                <IconBuilding />
              </Tooltip>
              {currentUser?.org || 'No organisation'}
            </span>
            <span className={detailsHeadingStyle}>
              <Tooltip title="Groups">
                <IconUsers />
              </Tooltip>
              {formatLimitedList(currentUser?.groups || [], 2, 'No groups')}
            </span>
            <span className={detailsHeadingStyle}>
              <Tooltip title="Permissions">
                <IconLock />
              </Tooltip>
              {formatLimitedList(
                permissions?.permissions || [],
                2,
                'No permissions',
              )}
            </span>
            <div className="flex justify-end mt-2">
              <Button
                type="text"
                size="small"
                icon={<IconLogout />}
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Button
                onClick={() => router.push('/account')}
                icon={<IconUser />}
                type="text"
                size="small"
              >
                View Profile
              </Button>
            </div>
          </div>
        }
      />
      {currentUser?.password_change_required && (
        <NotificationCard
          type="warning"
          title="Password Change Required"
          description={
            <Link
              className="text-foreground-muted dark:text-dark-foreground-muted hover:font-medium underline"
              href="/account?reset_password=true"
            >
              Update Password
            </Link>
          }
        />
      )}
    </div>
  );
};
