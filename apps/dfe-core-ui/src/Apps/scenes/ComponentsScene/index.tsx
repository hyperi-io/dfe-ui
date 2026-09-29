'use client';

import { BackingServices } from '@/Apps/components/BackingServices';
import { AppConfigCard } from '@/core/components/appManagement/AppConfigCard';
import { AppHistoryCard } from '@/core/components/appManagement/AppHistoryCard';
import { AppOperationalCard } from '@/core/components/appManagement/AppOperationalCard';
import { ScalingCard } from '@/core/components/appManagement/ScalingCard';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { MainContentCard } from '@/core/components/ContentCard';
import { NavigationTabLabel } from '@/core/components/NavigationTabLabel';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Spin, Tabs } from 'antd';

/**
 * The fleet-wide pools: one deployment serving every source.
 *
 * Which apps land here is the manifest's `multiplicity`, not a list kept in
 * the UI. Per-config apps are deliberately absent - an instance of one belongs
 * to its source, and lives on that source's page.
 *
 * The receiver's per-source routing rules are equally deliberately absent:
 * they belong to the sources that define them.
 */
export const ComponentsScene = () => {
  const { data: apps, isLoading, error } = useFetchApps();

  if (isLoading) {
    return (
      <MainContentCard>
        <Spin />
      </MainContentCard>
    );
  }

  if (error || !apps) {
    return (
      <MainContentCard>
        <NotificationCard
          type="error"
          title="Could not read the app catalogue"
          description={error?.message}
        />
      </MainContentCard>
    );
  }

  const pools = apps
    .filter((app) => app.multiplicity === 'single')
    .flatMap((app) =>
      app.instances.map((instance) => ({
        key: `${app.service}/${instance}`,
        service: app.service,
        instance,
        scaleDeployed: app.scale_deployed,
      })),
    );

  // The data layer is declared separately from the DFE pools and does not
  // depend on any being deployed, so it renders either way.
  if (pools.length === 0) {
    return (
      <MainContentCard>
        <NotificationCard
          type="info"
          title="No components are deployed"
          description="A component appears here once the deploy repo holds its values."
        />
        <div className="mt-6">
          <BackingServices />
        </div>
      </MainContentCard>
    );
  }

  return (
    <MainContentCard className="pl-0">
      <RbacProtected action={RbacProtected.rbacActions.deployment_read}>
        <RbacProtected.Unrestricted>
          <Tabs
            className="h-full min-h-0"
            tabPlacement="start"
            classNames={{
              root: 'min-h-0',
              header: 'w-full max-w-68 shrink-0',
              content: 'min-w-0 flex-1 pl-6',
            }}
            items={pools.map((pool) => ({
              key: pool.key,
              label: (
                <NavigationTabLabel
                  label={pool.service}
                  description={`Instance ${pool.instance}`}
                />
              ),
              children: (
                <div className="flex flex-col">
                  <AppOperationalCard
                    service={pool.service}
                    instance={pool.instance}
                  />
                  {pool.scaleDeployed && (
                    <ScalingCard
                      service={pool.service}
                      instance={pool.instance}
                    />
                  )}
                  <AppConfigCard
                    service={pool.service}
                    instance={pool.instance}
                  />
                  <AppHistoryCard
                    service={pool.service}
                    instance={pool.instance}
                  />
                </div>
              ),
            }))}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted className="h-full">
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>

      <div className="mt-8 pl-6">
        <BackingServices />
      </div>
    </MainContentCard>
  );
};
