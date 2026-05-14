import { Drawer } from '@/core/components/Drawer';

import {
  CreateSchemaForm,
  CreateSchemaFormData,
} from '@/Schemas/components/CreateSchemaForm';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useCreateSchema } from '@/Schemas/hooks/useCreateSchema';
import { SchemaCreateRequest } from '@/Schemas/hooks/useCreateSchema/types';
import { IconPlus } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
import { useState } from 'react';
import { transformFormDataToRequestBody } from './CreateSchemaDrawer.helpers';

export const CreateSchemaDrawer = ({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) => {
  const title = 'Add Schema';
  const [api, contextHolder] = notification.useNotification();
  const [isDrawerVisible, setIsDrawerVisible] = useState(open);

  const handleClose = () => {
    setIsDrawerVisible(false);
    onClose?.();
  };

  const {
    refetch: refetchSchemas,
    setSelectedSchemaPath,
    setSelectedSchemaVersion,
  } = useListSchemasContext();

  const { mutate: createSchema, isPending: isCreatingSchema } = useCreateSchema(
    {
      onSuccess: ({ path, current }) => {
        setSelectedSchemaPath(path ?? null);
        setSelectedSchemaVersion(current);
        refetchSchemas();
        api.success({
          title: 'Schema created successfully',
          placement: 'bottomLeft',
        });
        handleClose();
      },
    },
  );

  const handleFinish = (values: CreateSchemaFormData) => {
    const requestBody: SchemaCreateRequest =
      transformFormDataToRequestBody(values);
    createSchema(requestBody);
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
        size="80%"
        onClose={handleClose}
      >
        <CreateSchemaForm
          buttonLabel={title}
          onFinish={handleFinish}
          isPending={isCreatingSchema}
        />
      </Drawer>
    </>
  );
};
