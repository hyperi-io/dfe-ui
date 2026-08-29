'use client';

import { AppFileSets } from '@/core/components/appManagement/AppFileSets';
import { AppOperationalCard } from '@/core/components/appManagement/AppOperationalCard';
import { ScalingCard } from '@/core/components/appManagement/ScalingCard';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { useCreateAppInstance } from '@/core/hooks/apps/instances/useCreateAppInstance';
import { useDeleteAppInstance } from '@/core/hooks/apps/instances/useDeleteAppInstance';
import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, Collapse } from 'antd';

/**
 * One per-source app as it stands for this source.
 *
 * A per-config app's instance name IS the source name, so "is there a
 * transform for this source" is just "is there an instance called this". The
 * instance's whole surface - files, scaling, telemetry - lives here rather
 * than on a separate page, because a transform without its source is not a
 * thing an operator reasons about.
 */
export const SourceAppInstance = ({
  app,
  source,
}: {
  app: TAppCatalogueEntry;
  source: string;
}) => {
  const isDeployed = app.instances.includes(source);
  const {
    data: createResult,
    mutate: createInstance,
    isPending: isCreating,
    error: createError,
  } = useCreateAppInstance({ service: app.service });
  const {
    data: deleteResult,
    mutate: deleteInstance,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteAppInstance({ service: app.service, instance: source });

  const createMessage =
    getApiErrorResponseBody(createError)?.message ?? createError?.message;
  const deleteMessage =
    getApiErrorResponseBody(deleteError)?.message ?? deleteError?.message;

  if (!isDeployed) {
    return (
      <SectionCard
        title={app.service}
        description="Not deployed for this source."
        rightTitleSlot={
          <RbacProtected action={RbacProtected.rbacActions.deployment_write}>
            <RbacProtected.Unrestricted>
              <Button
                size="small"
                icon={<IconPlus />}
                loading={isCreating}
                onClick={() =>
                  createInstance({ instance: source, values: {} })
                }
              >
                Deploy
              </Button>
            </RbacProtected.Unrestricted>
          </RbacProtected>
        }
      >
        {createMessage && (
          <NotificationCard type="error" title={createMessage} />
        )}
        {createResult && <WriteResultFeedback result={createResult} />}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={app.service}
      description={`Instance ${source}`}
      rightTitleSlot={
        <RbacProtected action={RbacProtected.rbacActions.deployment_delete}>
          <RbacProtected.Unrestricted>
            <Button
              size="small"
              danger
              icon={<IconTrash />}
              loading={isDeleting}
              onClick={() => deleteInstance()}
            >
              Undeploy
            </Button>
          </RbacProtected.Unrestricted>
        </RbacProtected>
      }
    >
      {deleteMessage && <NotificationCard type="error" title={deleteMessage} />}
      {deleteResult && <WriteResultFeedback result={deleteResult} />}

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
                      instance={source}
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
              <AppOperationalCard service={app.service} instance={source} />
            ),
          },
          ...(app.scale_deployed
            ? [
                {
                  key: 'scaling',
                  label: 'Scaling',
                  children: (
                    <ScalingCard service={app.service} instance={source} />
                  ),
                },
              ]
            : []),
        ]}
      />
    </SectionCard>
  );
};
