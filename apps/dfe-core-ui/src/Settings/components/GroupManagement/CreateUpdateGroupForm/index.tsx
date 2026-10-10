import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { GroupMemberSelect } from '@/Settings/components/GroupManagement/GroupMemberSelect';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { Button, Input, Select } from 'antd';
import z from 'zod';

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required' })
      .refine((v) => STORE_NAME_VALIDATOR.regex.test(v), {
        message: STORE_NAME_VALIDATOR.message('Name'),
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
    scope: 'system',
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
    scope?: boolean;
    organisation?: boolean;
  };
  showMembersField?: boolean;
}) => {
  const [form] = Form.useForm<CreateUpdateGroupFormData>();
  const formValidation =
    useAntdZodResolver<CreateUpdateGroupFormData>(formSchema);

  const watchScope = Form.useWatch('scope', form);
  const isScopeOrg = watchScope === 'org';

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
          onChange={(value) => {
            if (value === 'system') {
              form.setFieldsValue({ organisation: '' });
            }
          }}
          disabled={disabledFields?.scope}
          options={[
            { label: 'Organisation', value: 'org' },
            { label: 'System', value: 'system' },
          ]}
        />
      </Form.Item>

      {isScopeOrg && (
        <Form.Item
          name="organisation"
          label="Organisation"
          rules={[formValidation]}
        >
          <OrganisationSelect disabled={disabledFields?.organisation} />
        </Form.Item>
      )}

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
