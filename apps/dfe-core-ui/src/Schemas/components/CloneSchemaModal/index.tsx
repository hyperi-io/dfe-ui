import { Form } from '@/core/components/Form';

import { FormNotification } from '@/core/components/FormNotification';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { SchemaCreateResponse } from '@/core/hooks/useCreateSchema/types';
import { SchemaListResponse } from '@/core/hooks/useFetchInfiniteFilteredSchemas/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  schemaGroupValidator,
  schemaNameValidator,
  schemaVersionValidator,
} from '@/core/validationSchemas/CreateSchemaForm/utils';
import { useCloneSchema } from '@/Schemas/hooks/useCloneSchema';
import { IconCopy } from '@repo/dfe-icons';
import { Button, Input, Modal, Select, Tooltip } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  path: schemaGroupValidator.optional(),
  name: schemaNameValidator,
  version: schemaVersionValidator,
  description: z.string().min(1, { message: 'Description is required' }),
});

type FormData = z.infer<typeof formSchema>;

interface CloneSchemaModalProps {
  schema: NonNullable<SchemaListResponse['objects']['items']>[number];
  versions: string[];
  onSuccess?: (data: SchemaCreateResponse) => void;
  onError?: (error: Error) => void;
}
export const CloneSchemaModal = ({
  schema,
  versions,
  onSuccess: onSuccessProp,
  onError,
}: CloneSchemaModalProps) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const [open, setOpen] = useState(false);

  const version = Form.useWatch('version', form);

  const { refetch: refetchSchemas } = useListSchemasContext();

  const onSuccess = (data: SchemaCreateResponse) => {
    refetchSchemas();
    onSuccessProp?.(data);
    setOpen(false);
  };
  const schemaFullName = schema.name;

  const {
    mutate: cloneSchemaMutation,
    isPending,
    error,
  } = useCloneSchema({
    schema_path: schemaFullName,
    version,
    onSuccess,
    onError,
  });
  const handleCloneSchema = (values: FormData) => {
    /** Set to 1.0.0 as a new version is being created
     * This is so that the clone only has 1 schema version and the new
     * version starts at 1.0.0 as an initial model insert
     */
    const newClonedVersion = '1.0.0';
    cloneSchemaMutation({
      ...values,
      version: newClonedVersion,
    });
  };

  const path = schemaFullName.split('/').slice(0, -1).join('/');
  const name = schemaFullName.split('/').pop();

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.schema_write}>
        <RbacProtected.Unrestricted>
          <Tooltip title={`Clone ${name}`} destroyOnHidden>
            <Button
              type="default"
              shape="circle"
              size="small"
              aria-label={`Clone ${name}`}
              icon={<IconCopy />}
              onClick={() => {
                setOpen(true);
              }}
            />
          </Tooltip>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted
          className="opacity-100"
          tooltip={{ show: true, placement: 'top' }}
        >
          <span className="bg-white rounded-full">
            <Button
              type="default"
              disabled
              shape="circle"
              size="small"
              aria-label={`Clone ${name}`}
              icon={<IconCopy />}
            />
          </span>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        title={`Clone ${name}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          onFinish={handleCloneSchema}
          initialValues={{
            path,
            name: `${name}_copy`,
            description: `Copy: ${name}`,
          }}
        >
          <div className="flex gap-x-2">
            <Form.Item
              name="path"
              label="Path"
              rules={[formValidation]}
              className="w-full mb-2"
            >
              <Input placeholder={`${path ?? ''}`} />
            </Form.Item>
            <Form.Item
              name="name"
              label="Name"
              rules={[formValidation]}
              className="w-full mb-2"
            >
              <Input placeholder={`${name}`} />
            </Form.Item>
          </div>

          <Form.Item
            name="version"
            label="Version"
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Select
              options={versions.map((version) => ({
                label: version,
                value: version,
              }))}
              placeholder="Select version"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[formValidation]}
            className="w-full mb-2"
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
          {error && <FormNotification text={error.message} type="error" />}
          <div className="flex justify-end gap-x-2">
            <Button
              loading={isPending}
              disabled={isPending}
              htmlType="submit"
              type="primary"
            >
              Clone
            </Button>
            <Button
              loading={isPending}
              disabled={isPending}
              type="default"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};
