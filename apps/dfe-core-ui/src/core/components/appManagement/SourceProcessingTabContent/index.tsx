'use client';

import { SourceAppInstance } from '@/core/components/appManagement/SourceAppInstance';
import { SourceRoutingCard } from '@/core/components/appManagement/SourceRoutingCard';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Spin } from 'antd';

/**
 * Everything that processes THIS source: how the receiver identifies it, and
 * the per-source apps that carry it onward.
 *
 * The receiver appears here and on Components by design. Its per-source rule
 * belongs to the source; its pool belongs to the fleet. Showing only one of
 * them either hides the routing or duplicates the pool.
 */
export const SourceProcessingTabContent = ({ source }: { source: string }) => {
  const { data: apps, isLoading, error } = useFetchApps();

  if (isLoading) return <Spin size="small" />;

  if (error || !apps) {
    return (
      <NotificationCard
        type="error"
        title="Could not read the app catalogue"
        description={error?.message}
      />
    );
  }

  // Multiplicity decides where an app belongs: a single deployment serves
  // every source, a per-config one is this source's own.
  const singleApps = apps.filter((app) => app.multiplicity === 'single');
  const perSourceApps = apps.filter((app) => app.multiplicity === 'per_config');

  return (
    <div className="flex flex-col">
      {singleApps.flatMap((app) =>
        app.instances.map((instance) => (
          <SourceRoutingCard
            key={`${app.service}/${instance}`}
            service={app.service}
            instance={instance}
            source={source}
            hasCompiledRouting={app.has_compiled_routing}
          />
        )),
      )}

      {perSourceApps.map((app) => (
        <SourceAppInstance key={app.service} app={app} source={source} />
      ))}

      {perSourceApps.length === 0 && (
        <NotificationCard
          type="info"
          variant="subtle"
          title="No per-source apps are available"
          description="The app manifest declares none, so there is nothing to deploy against this source."
        />
      )}
    </div>
  );
};
