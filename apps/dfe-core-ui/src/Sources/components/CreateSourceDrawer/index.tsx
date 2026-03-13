import { Drawer } from '@/core/components/Drawer';
import { useCreateSource } from '@/Sources/hooks/useCreateSource';
import { IconPlus } from '@dfe/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { useListSourcesContext } from '../../contexts/ListSourcesContext';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '../CreateUpdateSourceForm';

export const CreateSourceDrawer = () => {
  const title = 'Add Source';

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
  const handleCreateSource = (values: CreateUpdateSourceFormData) => {
    createSourceMutation(values);
  };
  return (
    <>
      <Button
        type="primary"
        icon={<IconPlus />}
        onClick={() => setIsDrawerVisible(true)}
      >
        {title}
      </Button>
      <Drawer
        title={title}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
      >
        <CreateUpdateSourceForm
          onFinish={handleCreateSource}
          onValuesChange={resetCreateSource}
          isPending={isPending}
          error={error ?? undefined}
        />
      </Drawer>
    </>
  );
};
