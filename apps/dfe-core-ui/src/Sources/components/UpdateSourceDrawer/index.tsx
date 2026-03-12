import { Drawer } from '@/core/components/Drawer';
import { SourceSummary } from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { IconEdit } from '@dfe/icons';
import { Button } from 'antd';
import { useState } from 'react';
import {
  CreateUpdateSourceForm,
  CreateUpdateSourceFormData,
} from '../CreateUpdateSourceForm';
import { useListSourcesContext } from '../ListSources/context';

interface UpdateSourceDrawerProps {
  source: SourceSummary;
}

export const UpdateSourceDrawer = ({ source }: UpdateSourceDrawerProps) => {
  const title = `Update ${source.display_name ?? source.source}`;

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { refetch: refetchSources } = useListSourcesContext();
  const {
    mutate: updateSourceMutation,
    isPending,
    error,
    reset: resetUpdateSource,
  } = useUpdateSource({
    onSuccess: () => {
      refetchSources();
      setIsDrawerVisible(false);
    },
  });
  const handleUpdateSource = (values: CreateUpdateSourceFormData) => {
    updateSourceMutation(values);
  };
  return (
    <>
      <Button
        type="default"
        shape="circle"
        aria-label={`Edit ${source.display_name ?? source.source}`}
        icon={<IconEdit />}
        onClick={() => setIsDrawerVisible(true)}
      />
      <Drawer
        title={title}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
      >
        <CreateUpdateSourceForm
          onFinish={handleUpdateSource}
          onValuesChange={resetUpdateSource}
          isPending={isPending}
          error={error ?? undefined}
          initialValues={source}
        />
      </Drawer>
    </>
  );
};
