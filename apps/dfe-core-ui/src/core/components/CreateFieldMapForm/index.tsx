import { FieldMapSelect } from '@/core/components/FieldMapSelect';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { SourceSelect } from '@/core/components/SourceSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, FormProps, Input } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { MappingBuilder } from './MappingBuilder';

export const formSchema = z.object({
  standard: z
    .string({ message: 'Standard is required' })
    .min(1, { message: 'Standard is required' }),
  source: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  inherits: z.string().nullable().optional(),
  mappings: z.array(
    z.tuple([
      z.string().min(1, { message: 'Source field is required' }),
      z.string().min(1, { message: 'Destination field is required' }),
    ]),
  ),
});

export type CreateFieldMapFormData = z.infer<typeof formSchema>;

type CreateFieldMapFormProps = FormProps<CreateFieldMapFormData> & {
  onFinish: (values: CreateFieldMapFormData) => void;
  isPending: boolean;
  error: Error | null;
  resetFormFields?: boolean;
  buttonLabel?: string;
  hasReset?: boolean;
  disabledFields?: {
    source?: boolean;
  };
};

export const CreateFieldMapForm = ({
  initialValues,
  onFinish,
  isPending = false,
  error,
  resetFormFields,
  buttonLabel = 'Save',
  hasReset = false,
  disabledFields,
  ...props
}: CreateFieldMapFormProps) => {
  const [form] = Form.useForm<CreateFieldMapFormData>();
  const formValidation = useAntdZodResolver<CreateFieldMapFormData>(formSchema);

  useEffect(() => {
    if (resetFormFields) {
      form.resetFields();
    }
  }, [resetFormFields, form]);

  return (
    <Form
      form={form}
      onFinish={onFinish}
      scrollToFirstError
      initialValues={{
        mappings: [['', '']],
        ...initialValues,
      }}
      layout="vertical"
      {...props}
    >
      <Form.Item name="standard" label="Standard Name" rules={[formValidation]}>
        <Input placeholder="Enter standard" />
      </Form.Item>
      <Form.Item name="source" label="Source" rules={[formValidation]}>
        <SourceSelect
          placeholder="Select source"
          allowClear
          disabled={disabledFields?.source}
        />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[formValidation]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>
      <Form.Item name="inherits" label="Inherits" rules={[formValidation]}>
        <FieldMapSelect placeholder="Select base field map" allowClear />
      </Form.Item>

      <MappingBuilder formValidation={formValidation} />

      {error && (
        <Form.Item>
          <FormNotification
            type="error"
            text={error.message ?? 'An unexpected error occurred'}
          />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button className="mr-2" type="default" htmlType="reset">
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
