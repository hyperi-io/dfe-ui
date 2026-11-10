'use client';

import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { BackingServiceCard } from '@/Platform/components/BackingServices/BackingServiceCard';
import { useFetchBackingServices } from '@/Platform/hooks/backingServices/useFetchBackingServices';
import { Spin } from 'antd';

/**
 * The data layer, one card per backing service.
 *
 * These are stateful services with data placed on each node, so none of them is
 * ever KEDA-driven: new capacity sits idle until something moves data onto it.
 * The list comes from the engine's catalogue, so a third backing service
 * appears here without a UI change.
 */
export const BackingServices = () => {
  const { data, isLoading, error } = useFetchBackingServices();
  const services = data ?? [];

  return (
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
        {!isLoading && !error && services.length === 0 && (
          <NotificationCard
            type="info"
            variant="subtle"
            title="No backing services are declared"
            description="The engine's catalogue is empty, so there is nothing to show."
          />
        )}
        {!isLoading &&
          !error &&
          services.map((service) => (
            <BackingServiceCard key={service.service} service={service} />
          ))}
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <RbacProtected.RestrictedRoute />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
