import { Drawer } from '@/core/components/Drawer';
import { cn } from '@/core/utils/style';
import {
  CreateFieldMapForm,
  CreateFieldMapFormData,
} from '@/Settings/components/CreateFieldMapForm';
import { useListFieldMapsContext } from '@/Settings/contexts/ListFieldMapsContext';
import { useCreateFieldMap } from '@/Settings/hooks/useCreateFieldMap';
import { FieldMap } from '@/Settings/hooks/useCreateFieldMap/types';
import { IconPlus } from '@dfe/icons';
import { Button, notification } from 'antd';
import { useState } from 'react';

interface CreateFieldMapDrawerProps {
  className?: {
    trigger?: string;
  };
  title?: string;
  onSuccess?: (data: FieldMap) => void;
  initialValues?: FieldMap;
  disabledFields?: {
    source?: boolean;
  };
}

export const CreateFieldMapDrawer = ({
  className,
  title = 'Add Field Map',
  onSuccess,
  initialValues,
  disabledFields,
}: CreateFieldMapDrawerProps) => {
  const { trigger } = className ?? {};
  const [api, contextHolder] = notification.useNotification();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { refetch: refetchFieldMaps } = useListFieldMapsContext();
  const {
    mutate: createFieldMapMutation,
    isPending,
    error,
    reset: resetCreateFieldMap,
  } = useCreateFieldMap({
    onSuccess: (data) => {
      refetchFieldMaps();
      setIsDrawerVisible(false);
      onSuccess?.(data);
      api.success({
        title: 'Source created successfully',
        placement: 'bottomLeft',
      });
    },
  });
  const handleCreateFieldMap = (values: CreateFieldMapFormData) => {
    const transformedValues = {
      ...values,
      mappings: values.mappings.reduce(
        (acc, mapping) => ({
          ...acc,
          [mapping[0]]: mapping[1],
        }),
        {},
      ),
    };
    createFieldMapMutation(transformedValues);
  };
  return (
    <>
      {contextHolder}
      <Button
        type="default"
        className={cn('border border-tertiary text-tertiary', trigger)}
        icon={<IconPlus className="text-tertiary" />}
        onClick={() => setIsDrawerVisible(true)}
      >
        {title}
      </Button>
      <Drawer
        key={title}
        title={title}
        open={isDrawerVisible}
        size="60%"
        onClose={() => {
          setIsDrawerVisible(false);
        }}
      >
        <CreateFieldMapForm
          onFinish={handleCreateFieldMap}
          onValuesChange={resetCreateFieldMap}
          isPending={isPending}
          error={error}
          buttonLabel={title}
          initialValues={initialValues}
          disabledFields={disabledFields}
        />
      </Drawer>
    </>
  );
};
