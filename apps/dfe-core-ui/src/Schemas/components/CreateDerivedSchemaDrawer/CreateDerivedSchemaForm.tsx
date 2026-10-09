import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DerivedSchemaFieldPicker } from '@/Schemas/components/DerivedSchemaFieldPicker';
import {
  CreateDerivedSchemaFormData,
  formSchema,
} from '@/Schemas/validationSchemas/CreateDerivedSchemaForm.schema';
import { Button, Input, Select } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { BaseMetaSchemaSelect } from './BaseMetaSchemaSelect';

export interface CreateDerivedSchemaFormProps {
  isPending?: boolean;
  errorMessage?: { message: string; errors?: { message?: string }[] } | null;
  onFinish: (values: CreateDerivedSchemaFormData) => void;
  onValuesChange?: () => void;
}

export const CreateDerivedSchemaForm = ({
  isPending = false,
  errorMessage,
  onFinish,
  onValuesChange,
}: CreateDerivedSchemaFormProps) => {
  const [form] = Form.useForm<CreateDerivedSchemaFormData>();
  const formValidation =
    useAntdZodResolver<CreateDerivedSchemaFormData>(formSchema);
  const [baseVersions, setBaseVersions] = useState<string[]>([]);

  const base = Form.useWatch('base', form);
  const baseVersion = Form.useWatch('base_version', form);

  /** A different base is a different column list, so the selection cannot survive it. */
  const handleBaseChange = useCallback(
    (value: string | null, meta: { versions: string[] }) => {
      setBaseVersions(meta.versions);
      form.setFieldsValue({
        base: value ?? '',
        base_version: meta.versions.length === 1 ? meta.versions[0] : '',
        select: [],
      });
    },
    [form],
  );

  const handleBaseVersionChange = useCallback(() => {
    form.setFieldsValue({ select: [] });
  }, [form]);

  const baseVersionOptions = useMemo(
    () => baseVersions.map((version) => ({ label: version, value: version })),
    [baseVersions],
  );

  return (
    <Form
      form={form}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      initialValues={{ version: '1.0.0', select: [] }}
    >
      <div className="grid grid-cols-2 gap-2">
        <Form.Item
          name="path"
          label="Path"
          tooltip="Prepends the file name in the directory structure"
          rules={[formValidation]}
        >
          <Input placeholder="Enter path" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true }, formValidation]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          name="base"
          label="Base Meta Schema"
          rules={[{ required: true }, formValidation]}
        >
          <BaseMetaSchemaSelect onChange={handleBaseChange} />
        </Form.Item>
        <Form.Item
          name="base_version"
          label="Base Version"
          rules={[{ required: true }, formValidation]}
        >
          <Select
            options={baseVersionOptions}
            disabled={!baseVersionOptions.length}
            onChange={handleBaseVersionChange}
            placeholder={
              baseVersionOptions.length
                ? 'Select base version'
                : 'Select a base meta schema first'
            }
          />
        </Form.Item>
        <Form.Item
          name="version"
          label="Version"
          rules={[{ required: true }, formValidation]}
        >
          <Input />
        </Form.Item>
      </div>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true }, formValidation]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        name="select"
        label="Columns"
        rules={[{ required: true }, formValidation]}
      >
        <DerivedSchemaFieldPicker
          basePath={base ?? null}
          baseVersion={baseVersion ?? null}
        />
      </Form.Item>

      {errorMessage && (
        <FormNotification
          type="error"
          title={errorMessage.message}
          text={
            errorMessage.errors?.map((error) => error?.message).join(', ') ?? ''
          }
        />
      )}

      <Form.Item className="flex justify-end">
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};
