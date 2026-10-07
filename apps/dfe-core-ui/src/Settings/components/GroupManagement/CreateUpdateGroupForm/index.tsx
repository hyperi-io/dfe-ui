import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { GroupMemberSelect } from '@/Settings/components/GroupManagement/GroupMemberSelect';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { GroupSourceProviderInput } from '@/Settings/components/GroupManagement/GroupSourceProviderInput';
import { Button, Input, Select } from 'antd';
import { useMemo, useState } from 'react';
import {
  createGroupFormSchema,
  CreateUpdateGroupFormData,
  GroupSourceLink,
} from './groupForm.schema';

export type {
  CreateUpdateGroupFormData,
  GroupSourceLink,
} from './groupForm.schema';

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
    source_id: '',
    source_provider: '',
  },
  disabledFields,
  showMembersField = false,
}: {
  name: string;
  onFinish: (
    values: CreateUpdateGroupFormData,
    stored: GroupSourceLink,
  ) => void;
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
  // antd reads initialValues only at mount, so the link an edit is judged against is fixed then too.
  const [stored] = useState<GroupSourceLink>(() => ({
    source_id: initialValues.source_id,
    source_provider: initialValues.source_provider,
  }));
  const formSchema = useMemo(() => createGroupFormSchema(stored), [stored]);
  const formValidation =
    useAntdZodResolver<CreateUpdateGroupFormData>(formSchema);

  const watchScope = Form.useWatch('scope', form);
  const isScopeOrg = watchScope === 'org';

  return (
    <Form
      name={name}
      form={form}
      onFinish={(values) => onFinish(values, stored)}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label={<Form.Label required>Name</Form.Label>}
        rules={[formValidation]}
      >
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
        name="roles"
        label={<Form.Label required>Roles</Form.Label>}
        rules={[formValidation]}
      >
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
          label={<Form.Label required>Organisation</Form.Label>}
          rules={[formValidation]}
        >
          <OrganisationSelect disabled={disabledFields?.organisation} />
        </Form.Item>
      )}

      <Form.Item
        name="source_id"
        label="Source ID"
        extra="The identifier your identity provider sends for this group in its tokens: the group name for Okta, dex and Keycloak, the object ID for Entra. Leave empty for a group managed only in DFE."
        rules={[formValidation]}
      >
        <Input placeholder="Enter source ID" />
      </Form.Item>

      <Form.Item
        name="source_provider"
        label="Source Provider"
        extra="The identity provider whose logins this link answers: an OIDC provider name or scim for SCIM-provisioned groups. Required with a source ID."
        dependencies={['source_id']}
        rules={[formValidation]}
      >
        <GroupSourceProviderInput />
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
