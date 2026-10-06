'use client';

import { AppConfigCard } from '@/core/components/appManagement/AppConfigCard';
import { AppOperationalCard } from '@/core/components/appManagement/AppOperationalCard';
import { ScalingCard } from '@/core/components/appManagement/ScalingCard';
import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { AppFileSets } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/AppFileSets';
import { Collapse } from 'antd';

/**
 * One deployed instance's whole surface: its files, its health, its dials.
 *
 * Shared by every per-source app, so which panels an app carries is decided by
 * its manifest here rather than once per calling surface.
 */
export const AppInstancePanels = ({
  app,
  instance,
}: {
  app: TAppCatalogueEntry;
  instance: string;
}) => (
  <Collapse
    defaultActiveKey={app.file_sets.length > 0 ? ['files'] : ['status']}
    items={[
      ...(app.file_sets.length > 0
        ? [
            {
              key: 'files',
              label: 'Files',
              children: (
                <AppFileSets
                  service={app.service}
                  instance={instance}
                  fileSets={app.file_sets}
                />
              ),
            },
          ]
        : []),
      {
        key: 'status',
        label: 'Status and metrics',
        children: (
          <AppOperationalCard service={app.service} instance={instance} />
        ),
      },
      ...(app.scale_deployed
        ? [
            {
              key: 'scaling',
              label: 'Scaling',
              children: (
                <ScalingCard service={app.service} instance={instance} />
              ),
            },
          ]
        : []),
      {
        key: 'settings',
        label: 'Settings',
        children: <AppConfigCard service={app.service} instance={instance} />,
      },
    ]}
  />
);
