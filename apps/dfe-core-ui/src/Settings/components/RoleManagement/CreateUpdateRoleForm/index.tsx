import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { RoleScopeSelect } from '@/Settings/components/RoleManagement/RoleScopeSelect';
import { Button, Input, Switch } from 'antd';
import { useMemo } from 'react';
import z from 'zod';

const requiredName = z.string().min(1, { message: 'Name is required' });

// The engine checks the name on create only, so an existing role's locked name stays unchecked.
const newName = requiredName.refine((v) => STORE_NAME_VALIDATOR.regex.test(v), {
  message: STORE_NAME_VALIDATOR.message('Name'),
});

const buildFormSchema = (nameIsNew: boolean) =>
  z.object({
    name: nameIsNew ? newName : requiredName,
    description: z.string().min(1, { message: 'Description is required' }),
    permissions: z
      .array(z.string())
      .min(1, { message: 'Permissions are required' }),
    scoped: z.boolean(),
  });

export type CreateUpdateRoleFormData = z.infer<
  ReturnType<typeof buildFormSchema>
>;

export const CreateUpdateRoleForm = ({
  name,
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
  disabledFields,
}: {
  name: string;
  onFinish: (values: CreateUpdateRoleFormData) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
  hasReset?: boolean;
  initialValues?: CreateUpdateRoleFormData;
  disabledFields?: {
    name?: boolean;
  };
}) => {
  const [form] = Form.useForm<CreateUpdateRoleFormData>();
  const formSchema = useMemo(
    () => buildFormSchema(!disabledFields?.name),
    [disabledFields?.name],
  );
  const formValidation =
    useAntdZodResolver<CreateUpdateRoleFormData>(formSchema);

  const handleFinish = (values: CreateUpdateRoleFormData) => {
    onFinish(values);
  };

  return (
    <Form
      name={name}
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Form.Item name="name" label="Name" rules={[formValidation]}>
        <Input placeholder="Enter name" disabled={disabledFields?.name} />
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
