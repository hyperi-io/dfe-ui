'use client';

import { BackingServiceCard } from '@/Apps/components/BackingServices/BackingServiceCard';
import { useFetchBackingServices } from '@/Apps/hooks/backingServices/useFetchBackingServices';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Spin } from 'antd';

/**
 * The data layer, alongside the DFE pools but not one of them.
 *
 * These are stateful services with data placed on each node, so none of them is
 * ever KEDA-driven: new capacity sits idle until something moves data onto it.
 * The list comes from the engine's catalogue, so a third backing service
 * appears here without a UI change.
 */
export const BackingServices = () => {
  const { data, isLoading, error } = useFetchBackingServices();

  return (
    <section className="flex flex-col">
      <header className="mb-4">
        <h2 className="text-base font-semibold">Backing services</h2>
        <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
          The data layer. Stateful, never autoscaled, and scaled up only - a
          node holds data, so removing one costs data rather than capacity.
        </p>
      </header>

      <RbacProtected action={RbacProtected.rbacActions.helmvars_read}>
        <RbacProtected.Unrestricted>
          {isLoading && <Spin size="small" />}
          {error && (
            <NotificationCard
              type="error"
              title="Could not read the backing services"
              description={error.message}
            />
          )}
          {!isLoading &&
            !error &&
            (data ?? []).map((service) => (
              <BackingServiceCard key={service.service} service={service} />
            ))}
          {!isLoading && !error && (data ?? []).length === 0 && (
            <NotificationCard
              type="info"
              variant="subtle"
              title="No backing services are declared"
              description="The engine's catalogue is empty, so there is nothing to show."
            />
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </section>
  );
};
