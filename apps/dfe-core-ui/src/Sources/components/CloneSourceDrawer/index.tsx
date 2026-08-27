import { Drawer } from '@/core/components/Drawer';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { useFetchSourceDetail } from '@/Sources/hooks/useFetchSourceDetail';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { IconCopy } from '@repo/dfe-icons';
import { Button, ButtonProps, notification, Spin, Tooltip } from 'antd';
import { cloneElement, useState } from 'react';

export const CloneSourceDrawer = ({
  open,
  onClose,
  sourceName,
  sourceVersion,
  trigger,
}: {
  open?: boolean;
  onClose?: () => void;
  sourceName: string;
  sourceVersion: string;
  trigger?: React.ReactElement<ButtonProps>;
}) => {
  const title = 'Clone Source';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleOpen = () => {
    setIsDrawerVisible(true);
  };

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const {
    data: sourceDetail,
    isLoading: isSourceDetailLoading,
    error: sourceDetailError,
  } = useFetchSourceDetail({
    source_name: sourceName,
    source_version: sourceVersion,
  });

  const { setSelectedSource } = useListSourcesContext();
  const {
    mutate: createSourceMutation,
    isPending,
    error,
    reset: resetCreateSource,
  } = useCreateSource({
    onSuccess: (response) => {
      setSelectedSource({
        source_name: response.source,
        source_version: response.current,
      });
      setIsDrawerVisible(false);
      api.success({
        title: 'Source cloned successfully',
        placement: 'bottomLeft',
      });
    },
  });
  const handleCloneSource = (values: CreateUpdateSourceFormData) => {
    const transformedValues = transformSourceFormDataToRequestBody(values);
    createSourceMutation(transformedValues);
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.source_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Tooltip destroyOnHidden title={`Clone ${sourceName}`}>
              <Button
                type="default"
                shape="circle"
                size="small"
                aria-label={`Clone ${sourceName}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </Tooltip>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="justify-start opacity-100"
          tooltip={{ show: true, placement: 'left' }}
        >
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              disabled: true,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                handleOpen();
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <span className="bg-white rounded-full">
              <Button
                type="default"
                shape="circle"
                disabled
                size="small"
                aria-label={`Clone ${sourceName}`}
                icon={<IconCopy />}
                onClick={handleOpen}
              />
            </span>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
        classNames={{ body: 'pt-0' }}
      >
        <div className="flex flex-col gap-4 mt-4">
          {isSourceDetailLoading && (
            <>
              <Spin /> <span className="sr-only">Loading source detail</span>
            </>
          )}
          {sourceDetailError && (
            <>
              <NotificationCard
                type="error"
                title="Error loading source detail"
                description={sourceDetailError.message}
              />
            </>
          )}

          {!isSourceDetailLoading && !sourceDetailError && !sourceDetail && (
            <NotificationCard
              type="warning"
              title="Unable to clone source"
              description="Source details are not available"
            />
          )}
        </div>

        {sourceDetail && (
          <CreateUpdateSourceForm
            onFinish={handleCloneSource}
            onValuesChange={resetCreateSource}
            isPending={isPending}
            error={error}
            buttonLabel={title}
            initialValues={{
              source: `${sourceName}-copy`,
              enabled: sourceDetail.enabled,
              state: sourceDetail.state,
              description: sourceDetail.description,
              display_name: `Copy - ${sourceDetail.display_name}`,
              current: sourceDetail.current,
              versions: sourceDetail.versions,
              match: {
                field: '',
                operator: 'equals',
                value: '',
              },
            }}
          />
        )}
      </Drawer>
    </>
  );
};
