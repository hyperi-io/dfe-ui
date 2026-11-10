'use client';

import { AppConfigCard } from '@/core/components/appManagement/AppConfigCard';
import { ScalingCard } from '@/core/components/appManagement/ScalingCard';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useComponentPools } from '@/core/hooks/apps/instances/useComponentPools';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { Spin, Tabs } from 'antd';

/**
 * Each fleet-wide component's scaling and settings, one tab per component.
 *
 * The Components page shows how each one is running. This is where it is
 * configured, with the open component in the URL as on that page.
 */
export const ComponentSettings = () => {
  const { data: apps, isLoading, error } = useFetchApps();
  const { activeKey, openPool, pools } = useComponentPools(apps);

  if (isLoading) {
    return <Spin />;
  }

  if (error || !apps) {
    return (
      <NotificationCard
        type="error"
        title="Could not read the app catalogue"
        description={error?.message}
      />
    );
  }

  if (pools.length === 0) {
    return (
      <NotificationCard
        type="info"
        title="No components are deployed"
        description="A component appears here once the deploy repo holds its values."
      />
    );
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={openPool}
      items={pools.map((pool) => ({
        key: pool.key,
        label: pool.defaultInstance
          ? pool.label
          : `${pool.label} (${pool.instance})`,
        children: (
          <div className="flex flex-col">
            {pool.scaleDeployed && (
              <ScalingCard service={pool.service} instance={pool.instance} />
            )}
            <AppConfigCard service={pool.service} instance={pool.instance} />
          </div>
        ),
      }))}
    />
  );
};
