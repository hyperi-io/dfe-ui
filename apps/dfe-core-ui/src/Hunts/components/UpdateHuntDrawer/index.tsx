import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateHuntForm,
  CreateUpdateHuntFormData,
} from '@/Hunts/components/CreateUpdateHuntForm';
import { HuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { useUpdateHunt } from '@/Hunts/hooks/useUpdateHunt';
import { HuntUpdateResponse } from '@/Hunts/hooks/useUpdateHunt/types';
import {
  transformHuntDetailToFormData,
  transformHuntFormDataToUpdateRequest,
} from '@/Hunts/utils/transformHuntData/transformHuntDetailToFormData';
import { IconEdit } from '@repo/dfe-icons';
import { Button, ButtonProps, notification } from 'antd';
import { cloneElement, useMemo, useState } from 'react';

interface UpdateHuntDrawerProps {
  hunt: HuntDetailResponse;
  open?: boolean;
  onClose?: () => void;
  trigger?: React.ReactElement<ButtonProps>;
  onSuccess?: (hunt: HuntUpdateResponse) => void;
}

export const UpdateHuntDrawer = ({
  hunt,
  open,
  onClose,
  trigger,
  onSuccess,
}: UpdateHuntDrawerProps) => {
  const title = 'Edit Hunt';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const initialValues = useMemo(
    () => transformHuntDetailToFormData(hunt),
    [hunt],
  );

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const {
    mutate: updateHuntMutation,
    isPending,
    error,
  } = useUpdateHunt({
    hunt_id: hunt.hunt_id,
    onSuccess: (response) => {
      setIsDrawerVisible(false);
      onClose?.();
      onSuccess?.(response);
      api.success({
        title: `${response.hunt_id} updated successfully`,
        placement: 'bottomLeft',
      });
    },
  });

  const handleUpdateHunt = (values: CreateUpdateHuntFormData) => {
    updateHuntMutation(transformHuntFormDataToUpdateRequest(values, hunt));
  };

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.hunt_write}>
        <RbacProtected.Unrestricted>
          {trigger ? (
            cloneElement(trigger, {
              ...trigger.props,
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                setIsDrawerVisible(true);
                trigger.props.onClick?.(event);
              },
            })
          ) : (
            <Button
              type="default"
              className="border border-tertiary text-tertiary"
              icon={<IconEdit className="text-tertiary" />}
              onClick={() => setIsDrawerVisible(true)}
            >
              {title}
            </Button>
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
            })
          ) : (
            <Button type="default" disabled icon={<IconEdit />}>
              {title}
            </Button>
          )}
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
      >
        <CreateUpdateHuntForm
          key={hunt.hunt_id}
          onFinish={handleUpdateHunt}
          isPending={isPending}
          error={error}
          buttonLabel={title}
          initialValues={initialValues}
          disabledFields={{
            hunt_id: true,
          }}
        />
      </Drawer>
    </>
  );
};
