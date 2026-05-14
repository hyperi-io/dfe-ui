import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, FormProps, Input, Select } from 'antd';
import { useState } from 'react';
import z from 'zod';
import { rowSchema } from './AddSchemaTable';
import { TYPE_OPTIONS } from './AddSchemaTable/fieldOptions.constants';
import { SchemaUploadCollapse } from './SchemaUploadCollapse';

const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const GROUP_REGEX = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;
const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/** Used for building the request body */
const formSchemaRequest = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
    }),
  path: z
    .string()
    .refine((v) => v && v.length > 0 && GROUP_REGEX.test(v), {
      message:
        'Groups must contain only letters, numbers, underscores, hyphens, and forward slashes',
    })
    .optional(),
  version: z
    .string()
    .min(1, { message: 'Version is required' })
    .refine((v) => VERSION_REGEX.test(v), {
      message: 'Version must be in the format x.x.x',
    }),
  type: z.enum(['model', 'addition', 'revision']),
  description: z.string().optional(),
  uploadedColumns: z.array(rowSchema).optional(),
  schemaColumns: z.array(rowSchema).optional(),
});

/** Used for state management and form controls */
const formSchemaControls = {
  uploadType: z.enum(['csv', 'json']),
  file: z.instanceof(Object).optional(),
};

const formSchema = formSchemaRequest.extend(formSchemaControls);

export type CreateSchemaFormData = z.infer<typeof formSchema>;

interface CreateSchemaFormProps extends FormProps<CreateSchemaFormData> {
  hasReset?: boolean;
  isPending?: boolean;
  buttonLabel?: string;
}

export const CreateSchemaForm = ({
  hasReset = false,
  isPending = false,
  buttonLabel = 'Save',
  onFinish: onFinishProp,
}: CreateSchemaFormProps) => {
  const [form] = Form.useForm<CreateSchemaFormData>();
  const formValidation = useAntdZodResolver<CreateSchemaFormData>(formSchema);
  const [showDescription, setShowDescription] = useState(true);

  const onFinish = (values: CreateSchemaFormData) => {
    onFinishProp?.(values);
  };

  return (
    <Form
      className="h-[calc(100vh-120px)] css-custom-scrollbar"
      form={form}
      onFinish={onFinish}
      preserve
    >
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name="path"
          rules={[formValidation]}
          label="Path"
          tooltip="Prepends the file name in the directory structure"
        >
          <Input placeholder="Enter path" />
        </Form.Item>

        <Form.Item
          className="w-full"
          name="name"
          label="Name"
          rules={[formValidation]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
      </div>
      <div className="flex gap-2 w-full">
        <Form.Item
          className="w-full"
          name="type"
          label="Type"
          rules={[formValidation]}
        >
          <Select options={TYPE_OPTIONS} placeholder="Select type" />
        </Form.Item>

        <Form.Item
          className="w-full"
          name="version"
          label="Version"
          rules={[formValidation]}
        >
          <Input placeholder="Enter version" />
        </Form.Item>
      </div>

      <div className="relative w-full">
        <button
          className="absolute top-0 right-0 z-2 cursor-pointer p-1"
          onClick={() => setShowDescription(!showDescription)}
        >
          {showDescription ? <IconChevronUp /> : <IconChevronDown />}
        </button>

        {!showDescription && (
          <button
            className="cursor-pointer border-b border-foreground/10 dark:border-dark-foreground/10 w-full text-left pb-2"
            onClick={(e) => {
              e.preventDefault();
              setShowDescription(true);
            }}
          >
            <label htmlFor="description">Description</label>
          </button>
        )}

        {showDescription && (
          <Form.Item
            name="description"
            label="Description"
            rules={[formValidation]}
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
        )}
      </div>

      <SchemaUploadCollapse form={form} formValidation={formValidation} />

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button
            className="mr-2"
            type="default"
            htmlType="reset"
            disabled={isPending}
          >
            Reset Form
          </Button>
        )}
        <Button
          loading={isPending}
          disabled={isPending}
          type="primary"
          htmlType="submit"
        >
          {buttonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
