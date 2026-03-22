import { Drawer } from '@/core/components/Drawer';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '@/Sources/components/CreateUpdateSourceForm';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { IconPlus } from '@dfe/icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

export const CreateSourceDrawer = () => {
  const title = 'Add Source';
  const [api, contextHolder] = notification.useNotification();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { refetch: refetchSources, setSelectedSourceName } =
    useListSourcesContext();
  const {
    mutate: createSourceMutation,
    isPending,
    error,
    reset: resetCreateSource,
  } = useCreateSource({
    onSuccess: ({ source }) => {
      setSelectedSourceName(source);
      refetchSources();
      setIsDrawerVisible(false);
      api.success({
        title: 'Source created successfully',
        placement: 'bottomLeft',
      });
    },
  });
  const handleCreateSource = (values: CreateUpdateSourceFormData) => {
    createSourceMutation(values);
  };
  return (
    <>
      {contextHolder}
      <Button
        type="default"
        className="border border-tertiary text-tertiary"
        icon={<IconPlus className="text-tertiary" />}
        onClick={() => setIsDrawerVisible(true)}
      >
        {title}
      </Button>
      <Drawer
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={() => {
          setIsDrawerVisible(false);
        }}
      >
        <CreateUpdateSourceForm
          onFinish={handleCreateSource}
          onValuesChange={resetCreateSource}
          isPending={isPending}
          error={error}
          buttonLabel={title}
        />
      </Drawer>
    </>
  );
};
