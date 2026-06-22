import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  CreateUpdateHuntForm,
  CreateUpdateHuntFormData,
} from '@/Hunts/components/CreateUpdateHuntForm';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { useCreateHunt } from '@/Hunts/hooks/useCreateHunt';

import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateHuntDrawer = ({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) => {
  const title = 'Add Hunt';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const { refetch: refetchHunts, setSelectedHuntId } = useListHuntsContext();
  const {
    mutate: createHuntMutation,
    isPending,
    error,
  } = useCreateHunt({
    onSuccess: (response) => {
      setSelectedHuntId(response.hunt_id);
      refetchHunts();
      setIsDrawerVisible(false);
      api.success({
        title: 'Hunt created successfully',
        placement: 'bottomLeft',
      });
    },
  });
  const handleCreateHunt = (values: CreateUpdateHuntFormData) => {
    createHuntMutation({
      ...values,
      cron: '* * * * *',
      log_buffer: 60,
      global_target_table_name: '',
      global_source_table_name: '',
      customers: [],
      rules: [],
      hunt_id: '',
    });
  };
  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.hunt_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          tooltip={{
            show: true,
            placement: 'bottom',
          }}
        >
          <Button
            type="default"
            disabled
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={handleClose}
      >
        <CreateUpdateHuntForm
          onFinish={handleCreateHunt}
          isPending={isPending}
          error={error}
          buttonLabel={title}
          initialValues={{
            name: '',
            user_sql: '',
            severity: 'medium',
            source_type: 'raw',
            cel_filter: '',
            hunt_name: '',
          }}
        />
      </Drawer>
    </>
  );
};
