'use client';

import { AdminLinksTable } from '@/AdminTools/components/AdminLinksTable';
import { useFetchAdminLinks } from '@/AdminTools/hooks/useFetchAdminLinks';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { ApiError } from '@/core/config/api/client';
import { IconRefresh } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';

/**
 * The admin UIs this deployment runs, each a link out with its last status.
 *
 * The list is the engine's, which reads it from the deployer, so the console
 * never names a UI of its own.
 */
export const AdminLinksPanel = () => {
  const { data, isLoading, isFetching, error, refetch } = useFetchAdminLinks();

  // The sidebar gate and the engine's gate can disagree, and the engine wins.
  if (error instanceof ApiError && error.status === 403) {
    return <RbacProtected.RestrictedRoute />;
  }

  return (
    <SectionCard
      title={<h2 className="text-base font-semibold">Admin UIs</h2>}
      description="Listed by the deployer. The engine checks each one at most every 30 seconds."
      rightTitleSlot={
        <Button
          size="small"
          icon={<IconRefresh />}
          loading={isFetching && !isLoading}
          disabled={isLoading}
          onClick={() => void refetch()}
        >
          Refresh
        </Button>
      }
    >
      {isLoading && <Spin size="small" />}
      {error && (
        <NotificationCard
          type="error"
          title="Could not read the admin UIs"
          description={error.message}
        />
      )}
      {data?.length === 0 && (
        <NotificationCard
          type="info"
          title="No admin UIs are listed"
          description="The deployer listed none in deployment.admin_links, so there is nothing to open here."
        />
      )}
      {data && data.length > 0 && <AdminLinksTable links={data} />}
    </SectionCard>
  );
};
