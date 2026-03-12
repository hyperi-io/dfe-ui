import { Drawer } from '@/core/components/Drawer';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { IconPlus } from '@dfe/icons';
import { Button } from 'antd';
import { useState } from 'react';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '../CreateUpdateSourceForm';
import { useListSourcesContext } from '../ListSources/context';

export const CreateSourceDrawer = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { refetch: refetchSources } = useListSourcesContext();
  const {
    mutate: createSourceMutation,
    isPending,
    error,
    reset: resetCreateSource,
  } = useCreateSource({
    onSuccess: () => {
      refetchSources();
      setIsDrawerVisible(false);
    },
  });
  const handleCreateUpdateSource = (values: CreateUpdateSourceFormData) => {
    createSourceMutation(values);
  };
  return (
    <>
      <Button
        type="primary"
        icon={<IconPlus />}
        onClick={() => setIsDrawerVisible(true)}
      >
        Add Source
      </Button>
      <Drawer
        title="Add Source"
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
      >
        <CreateUpdateSourceForm
          onFinish={handleCreateUpdateSource}
          onValuesChange={resetCreateSource}
          isPending={isPending}
          error={error ?? undefined}
        />
      </Drawer>
    </>
  );
};
