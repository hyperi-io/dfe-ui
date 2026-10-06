'use client';

import { AppInstancePanels } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/AppInstancePanels';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { WriteResultFeedback } from '@/core/components/WriteResultFeedback';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import { useCreateAppInstance } from '@/core/hooks/apps/instances/useCreateAppInstance';
import { useDeleteAppInstance } from '@/core/hooks/apps/instances/useDeleteAppInstance';
import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';

/**
 * Names the app, as a heading rather than loose text.
 *
 * The card header also holds the deploy or undeploy action, so without this the
 * app's name has no accessible name of its own to address it by.
 */
const AppHeading = ({ service }: { service: string }) => (
  <h2 className="text-foreground-muted dark:text-dark-foreground-muted text-base font-semibold">
    {service}
  </h2>
);

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
        title={<AppHeading service={app.service} />}
        rightTitleSlot={
          <RbacProtected action={RbacProtected.rbacActions.deployment_write}>
            <RbacProtected.Unrestricted>
              <Button
                size="small"
                icon={<IconPlus />}
                loading={isCreating}
                onClick={() => createInstance({ instance: source, values: {} })}
              >
                Deploy
              </Button>
            </RbacProtected.Unrestricted>
          </RbacProtected>
        }
      >
        <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
          Not deployed for this source.
        </p>
        {createMessage && (
          <NotificationCard type="error" title={createMessage} />
        )}
        {createResult && <WriteResultFeedback result={createResult} />}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={<AppHeading service={app.service} />}
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
      <p className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
        {`Instance ${source}`}
      </p>
      {deleteMessage && <NotificationCard type="error" title={deleteMessage} />}
      {deleteResult && <WriteResultFeedback result={deleteResult} />}

      <AppInstancePanels app={app} instance={source} />
    </SectionCard>
  );
};
