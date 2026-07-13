import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { DB_NAME_REGEX } from '@/core/validationSchemas/CreateSchemaForm/utils';
import { GroupMemberSelect } from '@/Settings/components/GroupManagement/GroupMemberSelect';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { OrganisationSelect } from '@/Settings/components/OrganisationManagement/OrganisationSelect';
import { Button, Input, Select } from 'antd';
import z from 'zod';

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .refine((v) => DB_NAME_REGEX.test(v), {
        message:
          'Name must contain only letters, numbers, underscores, and hyphens',
      }),
    description: z.string(),
    roles: z.array(z.string()).min(1, { message: 'Roles are required' }),
    members: z.array(z.string()).optional(),
    scope: z.enum(['org', 'system']),
    organisation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scope === 'org' && !data.organisation?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Organisation is required',
        path: ['organisation'],
      });
    }
  });

export type CreateUpdateGroupFormData = z.infer<typeof formSchema>;

export const CreateUpdateGroupForm = ({
  name,
  onFinish,
  error,
  isPending,
  buttonLabel = 'Save',
  initialValues = {
    name: '',
    description: '',
    roles: [],
    members: [],
    scope: 'org',
    organisation: '',
  },
  disabledFields,
  showMembersField = false,
}: {
  name: string;
  onFinish: (values: CreateUpdateGroupFormData) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
  initialValues?: CreateUpdateGroupFormData;
  disabledFields?: {
    name?: boolean;
  };
  showMembersField?: boolean;
}) => {
  const [form] = Form.useForm<CreateUpdateGroupFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateGroupFormData>(formSchema);

  return (
    <Form
      name={name}
      form={form}
      onFinish={onFinish}
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

      <Form.Item name="roles" label="Roles" rules={[formValidation]}>
        <GroupRoleSelect />
      </Form.Item>

      <Form.Item name="scope" label="Scope" rules={[formValidation]}>
        <Select
          options={[
            { label: 'Organisation', value: 'org' },
            { label: 'System', value: 'system' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="organisation"
        label="Organisation"
        rules={[formValidation]}
      >
        <OrganisationSelect />
      </Form.Item>

      {showMembersField && (
        <Form.Item name="members" label="Members" rules={[formValidation]}>
          <GroupMemberSelect />
        </Form.Item>
      )}

      {error && (
        <Form.Item>
          <FormNotification type="error" text={error.message} />
        </Form.Item>
      )}

      <Form.Item className="flex justify-end">
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
