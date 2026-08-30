'use client';

import { DeclaredValue } from '@/Apps/components/BackingServices/DeclaredValue';
import { ReplicaField } from '@/Apps/components/BackingServices/ReplicaField';
import { ResourceField } from '@/Apps/components/BackingServices/ResourceField';
import { TBackingService } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';

export const STORAGE_REMEDY =
  "Size and class are fixed at deploy: a PVC template cannot be edited in place, and growing one means patching every claim and recreating the StatefulSet. Capacity is the storage model's job - S3-backed disks for ClickHouse, tiered storage for Kafka - not a size edit.";

/**
 * A friendly label for a resource dot-path, without hardcoding the set.
 *
 * `resources.requests.cpu` reads as "CPU request", and an unknown path falls
 * back to itself rather than being dropped, so a new dial the engine adds is
 * still shown.
 */
export const resourceLabel = (path: string): string => {
  const match = /^resources\.(requests|limits)\.(cpu|memory)$/.exec(path);
  if (!match) return path;
  const kind = match[2] === 'cpu' ? 'CPU' : 'Memory';
  return `${kind} ${match[1] === 'requests' ? 'request' : 'limit'}`;
};

/**
 * One backing service: what the deploy repo declares, and the dials that may
 * still move.
 *
 * The write path addresses the overlay by CHART and takes the full dot-path the
 * overlay stores. The API does not report the value prefix, so it is taken from
 * the service name - true for every catalogue entry today, and the one place a
 * third service could need engine support.
 */
export const BackingServiceCard = ({
  service,
}: {
  service: TBackingService;
}) => {
  const prefix = service.service;
  const overlayName = service.chart;
  const resources = service.resources ?? {};

  return (
    <SectionCard title={service.service}>
      <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
        {`Chart ${service.chart}, declared in ${service.overlay}. These are the values the deploy repo asks for, not what the cluster is running.`}
      </p>

      <dl className="grid grid-cols-[10rem_1fr] items-center gap-2 text-sm">
        <dt className="font-semibold">Mode</dt>
        <dd>
          <DeclaredValue declared={service.mode} />
        </dd>
        <dt className="font-semibold">Storage model</dt>
        <dd>
          <DeclaredValue declared={service.storage_model} />
        </dd>
        <dt className="font-semibold">Storage size</dt>
        <dd>
          <DeclaredValue declared={service.storage_size} />
        </dd>
        <dt className="font-semibold">Storage class</dt>
        <dd>
          <DeclaredValue declared={service.storage_class} />
        </dd>
      </dl>

      <NotificationCard
        type="info"
        variant="subtle"
        title="Storage is read-only"
        description={STORAGE_REMEDY}
      />

      <ReplicaField
        service={service.service}
        overlayName={overlayName}
        varPath={`${prefix}.replicas`}
        declared={service.replicas}
      />

      {Object.entries(resources).map(([path, declared]) => (
        <ResourceField
          key={path}
          service={service.service}
          overlayName={overlayName}
          label={resourceLabel(path)}
          varPath={`${prefix}.${path}`}
          declared={declared}
        />
      ))}
    </SectionCard>
  );
};
