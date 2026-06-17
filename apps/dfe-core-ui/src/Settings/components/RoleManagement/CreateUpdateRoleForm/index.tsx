import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_REGEX } from '@/core/validationSchemas/CreateSchemaForm/utils';
import { RoleScopeSelect } from '@/Settings/components/RoleManagement/RoleScopeSelect';
import { Button, Input, Switch } from 'antd';
import z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((v) => DB_NAME_REGEX.test(v), {
      message:
        'Name must contain only letters, numbers, underscores, and hyphens',
    }),
  description: z.string().min(1, { message: 'Description is required' }),
  permissions: z
    .array(z.string())
    .min(1, { message: 'Permissions are required' }),
  scoped: z.boolean(),
});

export type CreateUpdateRoleFormData = z.infer<typeof formSchema>;

export const CreateUpdateRoleForm = ({
  onFinish,
  error,
  isPending,
  buttonLabel = 'Save',
  hasReset = false,
  initialValues = {
    name: '',
    permissions: [],
    description: '',
    scoped: false,
  },
}: {
  onFinish: (values: CreateUpdateRoleFormData) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
  hasReset?: boolean;
  initialValues?: CreateUpdateRoleFormData;
}) => {
  const [form] = Form.useForm<CreateUpdateRoleFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateRoleFormData>(formSchema);

  const handleFinish = (values: CreateUpdateRoleFormData) => {
    onFinish(values);
  };

  return (
    <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
      <Form.Item name="name" label="Name" rules={[formValidation]}>
        <Input placeholder="Enter name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[formValidation]}
      >
        <Input.TextArea placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        name="permissions"
        label="Permissions"
        rules={[formValidation]}
      >
        <RoleScopeSelect />
      </Form.Item>
      <Form.Item name="scoped" label="Scoped" rules={[formValidation]}>
        <Switch />
      </Form.Item>

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
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
