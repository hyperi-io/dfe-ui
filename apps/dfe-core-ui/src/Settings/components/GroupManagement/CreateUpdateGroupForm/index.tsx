import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { GroupMemberSelect } from '@/Settings/components/GroupManagement/GroupMemberSelect';
import { GroupRoleSelect } from '@/Settings/components/GroupManagement/GroupRoleSelect';
import { GroupSourceProviderInput } from '@/Settings/components/GroupManagement/GroupSourceProviderInput';
import { Button, Input } from 'antd';
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
    source_id: '',
    source_provider: '',
  },
  disabledFields,
  showMembersField = false,
  savedLink,
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
  };
  showMembersField?: boolean;
  /** The link as the engine holds it now, which can move after the form opens. */
  savedLink?: GroupSourceLink;
}) => {
  const [form] = Form.useForm<CreateUpdateGroupFormData>();
  // antd reads initialValues only at mount, so the link an edit is judged against is fixed then too.
  const [stored, setStored] = useState<GroupSourceLink>(() => ({
    source_id: initialValues.source_id,
    source_provider: initialValues.source_provider,
  }));
  const formSchema = useMemo(() => createGroupFormSchema(stored), [stored]);
  const formValidation =
    useAntdZodResolver<CreateUpdateGroupFormData>(formSchema);

  const linkMoved =
    !!savedLink &&
    (savedLink.source_id !== stored.source_id ||
      savedLink.source_provider !== stored.source_provider);
  const loadSavedLink = () => {
    if (!savedLink) return;
    setStored(savedLink);
    form.setFieldsValue(savedLink);
  };

  return (
    <Form
      name={name}
      form={form}
      onFinish={(values) => onFinish(values, stored)}
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

      {linkMoved && (
        <Form.Item>
          <NotificationCard
            type="warning"
            title="The saved link changed since this form opened"
            description={`Saved now: source ID "${savedLink.source_id}", provider "${savedLink.source_provider}". Saving keeps it unless you edit the link fields.`}
            action={
              <Button htmlType="button" onClick={loadSavedLink}>
                Load saved link
              </Button>
            }
          />
        </Form.Item>
      )}

      <Form.Item
        name="source_id"
        label="Source ID"
        tooltip="The group's name in your identity provider (object ID for Entra)."
        rules={[formValidation]}
      >
        <Input placeholder="Enter source ID" />
      </Form.Item>

      <Form.Item
        name="source_provider"
        label="Source Provider"
        tooltip="The OIDC provider the group comes from (scim for SCIM)."
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
