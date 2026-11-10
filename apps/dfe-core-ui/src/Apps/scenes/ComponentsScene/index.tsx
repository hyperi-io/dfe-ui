'use client';

import { AppHistoryCard } from '@/Apps/components/AppHistoryCard';
import { AppOperationalCard } from '@/core/components/appManagement/AppOperationalCard';
import { MainContentCard } from '@/core/components/ContentCard';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NavigationTabLabel } from '@/core/components/NavigationTabLabel';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useComponentPools } from '@/core/hooks/apps/instances/useComponentPools';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { Input, Spin, Tabs } from 'antd';
import { useState } from 'react';

const SETTINGS_PATH = '/settings/platform/components';

/**
 * The fleet-wide pools: one deployment serving every source.
 *
 * This page shows how each one is running. Its scaling and settings, and the
 * backing services, live under Platform settings.
 *
 * Per-config apps are deliberately absent - an instance of one belongs to its
 * source, and lives on that source's page. The receiver's per-source routing
 * rules are equally deliberately absent: they belong to the sources that
 * define them.
 *
 * A process deployed on its own from an app's image, such as
 * dfe-hunt-runner from the engine's, has a tab of its own after that app's.
 *
 * The open component is in the URL as `?component=<service>`, with
 * `&instance=` only when it is not the default one and `&process=` for a
 * process, so a reload or a shared link opens it.
 */
export const ComponentsScene = () => {
  const { data: apps, isLoading, error } = useFetchApps();
  const { activeKey, openPool, pools } = useComponentPools(apps, {
    includeProcesses: true,
  });
  const [search, setSearch] = useState('');

  // 44px of the offset is the search box above the tabs
  const { componentHeight } = useSetComponentHeight({
    offset: 244,
  });

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

  if (pools.length === 0) {
    return (
      <MainContentCard>
        <NotificationCard
          type="info"
          title="No components are deployed"
          description="A component appears here once the deploy repo holds its values."
        />
      </MainContentCard>
    );
  }

  const needle = search.trim().toLowerCase();
  const visiblePools = needle
    ? pools.filter(
        (pool) =>
          pool.label.toLowerCase().includes(needle) ||
          pool.service.toLowerCase().includes(needle),
      )
    : pools;
  // A search that hides the open component shows the first match
  const selectedKey =
    visiblePools.find((pool) => pool.key === activeKey)?.key ??
    visiblePools[0]?.key;

  return (
    <MainContentCard className="pl-0">
      <RbacProtected action={RbacProtected.rbacActions.deployment_read}>
        <RbacProtected.Unrestricted>
          <div className="mb-3 max-w-68">
            <Input
              allowClear
              type="search"
              aria-label="Search components"
              placeholder="Search components"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {visiblePools.length === 0 ? (
            <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
              No components match this search.
            </p>
          ) : (
            <Tabs
              activeKey={selectedKey}
              onChange={openPool}
              style={{ height: componentHeight }}
              tabPlacement="start"
              classNames={{
                root: 'min-h-0',
                header: 'w-full max-w-68 shrink-0',
                content: 'min-w-0 flex-1 pl-6',
              }}
              items={visiblePools.map((pool) => ({
                key: pool.key,
                // Mounts every pane on page open, so a first click finds data
                forceRender: true,
                label: (
                  <NavigationTabLabel
                    label={pool.label}
                    description={
                      pool.process
                        ? `Uses the ${pool.service} image`
                        : `Instance ${pool.instance}`
                    }
                  />
                ),
                children: (
                  // Only the pane scrolls, so every tab stays in view
                  <CustomScrollbar height={componentHeight}>
                    {pool.process ? (
                      // Its settings and history are its app's
                      <AppOperationalCard
                        service={pool.service}
                        instance={pool.instance}
                        live={pool.key === selectedKey}
                        process={pool.process}
                      />
                    ) : (
                      <div className="flex flex-col">
                        <AppOperationalCard
                          service={pool.service}
                          instance={pool.instance}
                          live={pool.key === selectedKey}
                          settingsHref={`${SETTINGS_PATH}?${pool.query}`}
                        />
                        <AppHistoryCard
                          service={pool.service}
                          instance={pool.instance}
                        />
                      </div>
                    )}
                  </CustomScrollbar>
                ),
              }))}
            />
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted className="h-full">
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
