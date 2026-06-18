import {
  CreateFieldMapForm,
  CreateFieldMapFormData,
} from '@/core/components/CreateFieldMapForm';
import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useListFieldMapsContext } from '@/core/contexts/ListFieldMapsContext';
import { useCreateFieldMap } from '@/core/hooks/useCreateFieldMap';
import { FieldMap } from '@/core/hooks/useCreateFieldMap/types';
import { cn } from '@/core/utils/style';
import { IconPlus } from '@repo/dfe-icons';
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
        title: 'Field map created successfully',
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
      <RbacProtected action={RbacProtected.rbacActions.CONFIG_WRITE}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className={cn('border border-tertiary text-tertiary', trigger)}
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="mt-auto"
          tooltip={{ show: true, placement: 'top' }}
        >
          <Button
            type="default"
            disabled
            className={cn('border border-tertiary text-tertiary', trigger)}
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsDrawerVisible(true)}
          >
            {title}
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
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
