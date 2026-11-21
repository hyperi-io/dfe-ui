import {
  AccountAccessFields,
  AccountDetailFields,
} from '@/core/components/AccountFields';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  chosenOrg,
  ORG_CHOICE_NAME,
  ORG_NAME,
  type TOrgChoice,
} from '@/core/components/OrgChoiceFormItem';
import { ORG_ROLE_NAME } from '@/core/components/OrgRoleFormItem';
import { orgRoleGroup } from '@/core/helpers/orgRoles';
import { TAccountCreateRequestBody } from '@/core/hooks/useCreateAccount/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { accountNameSchema } from '@/core/validationSchemas/accountName.schema';
import { newPasswordSchema } from '@/core/validationSchemas/password.schema';
import { STORE_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { Button, Tabs } from 'antd';
import { useState } from 'react';
import z from 'zod';

// The Form spaces its own children, so each tab panel repeats that column for the fields inside it.
const PANEL = 'flex flex-col gap-3';

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .refine((v) => STORE_NAME_VALIDATOR.regex.test(v), {
      message: STORE_NAME_VALIDATOR.message('Username'),
    }),
  password: newPasswordSchema,
  groups: z.array(z.string()).optional(),
  email: z.email({ message: 'Valid email is required' }),
  phone: z.string().optional().nullable(),
  name: accountNameSchema(true),
  org: z.string().optional().nullable(),
  org_choice: z.enum(['none', 'own', 'customer']).optional(),
  org_role: z.enum(['viewer', 'admin']).optional(),
});

export type CreateAccountFormData = z.infer<typeof formSchema>;

const DETAIL_FIELDS = ['username', 'email', 'name', 'phone', 'password'];

/** The line the organisation step ends on, naming where the account lands, once that is chosen. */
const placementOf = ({
  choice,
  groups,
  org,
  role,
  username,
}: {
  choice?: TOrgChoice;
  groups?: readonly string[];
  org: string;
  role?: string;
  username?: string;
}): string | undefined => {
  const who = username || 'The account';
  if (choice === 'own') {
    const held = groups?.length ? `, in ${groups.join(', ')}` : '';
    return `${who} is created in your organisation${held}.`;
  }
  if (choice === 'customer' && org) {
    return `${who} is created in ${org} as ${role === 'admin' ? 'Admin' : 'Viewer'}.`;
  }
  return undefined;
};

export const CreateAccountForm = ({
  onFinish,
  disabledFields,
  hiddenFields,
  error,
  isPending,
  buttonLabel = 'Create Account',
  initialValues = {
    username: '',
    password: '',
    groups: [],
    email: '',
    phone: '',
    name: '',
  },
}: {
  onFinish: (values: TAccountCreateRequestBody) => void;
  error: Error | null;
  isPending: boolean;
  buttonLabel?: string;
  initialValues?: CreateAccountFormData;
  disabledFields?: {
    groups?: boolean;
  };
  /** The setup wizard's first account is a dfe-admins administrator, bound to no organisation. */
  hiddenFields?: {
    org?: boolean;
  };
}) => {
  const [form] = Form.useForm<CreateAccountFormData>();
  const formValidation = useAntdZodResolver<CreateAccountFormData>(formSchema);
  // The organisation is its own tab, reached only once the details pass, so it is never chosen by accident.
  const stepped = !hiddenFields?.org;
  const [step, setStep] = useState(0);
  const choice: TOrgChoice | undefined = Form.useWatch(ORG_CHOICE_NAME, form);
  const picked: string | null | undefined = Form.useWatch(ORG_NAME, form);
  const role: string | undefined = Form.useWatch(ORG_ROLE_NAME, form);
  const username: string | undefined = Form.useWatch('username', form);
  const groups: string[] | undefined = Form.useWatch('groups', form);
  const org = stepped ? chosenOrg({ choice, org: picked, ownOrg: '' }) : '';
  const placement = placementOf({ choice, groups, org, role, username });

  const handleNext = async () => {
    await form.validateFields(DETAIL_FIELDS);
    setStep(1);
  };

  const handleFinish = (values: CreateAccountFormData) => {
    const boundOrg = stepped
      ? chosenOrg({ choice: values.org_choice, org: values.org, ownOrg: '' })
      : '';
    onFinish({
      username: values.username,
      password: values.password,
      // A customer organisation's account holds one role there instead of free groups.
      groups:
        values.org_choice === 'customer' && boundOrg
          ? [orgRoleGroup(boundOrg, values.org_role ?? 'viewer')]
          : (values.groups ?? []),
      email: values.email,
      phone: values.phone ?? '',
      name: (values.name ?? '').trim(),
      org: boundOrg,
    });
  };

  const errorNotice = error && (
    <Form.Item>
      <ApiErrorNotification error={error} />
    </Form.Item>
  );

  const submit = (
    <Button
      loading={isPending}
      disabled={isPending || (stepped && !placement)}
      type="primary"
      htmlType="submit"
    >
      {buttonLabel}
    </Button>
  );

  return (
    <Form
      name="create-account-form"
      form={form}
      onFinish={handleFinish}
      onFinishFailed={({ errorFields }) => {
        // A detail refused on submit is shown on its own tab.
        if (
          errorFields.some(({ name }) =>
            DETAIL_FIELDS.includes(String(name[0])),
          )
        ) {
          setStep(0);
        }
      }}
      initialValues={{ org_role: 'viewer', ...initialValues }}
    >
      {stepped && (
        <Tabs
          activeKey={step === 0 ? 'details' : 'organisation'}
          items={[
            { key: 'details', label: 'Details' },
            { key: 'organisation', label: 'Organisation' },
          ]}
          onChange={(key) =>
            key === 'organisation' ? void handleNext() : setStep(0)
          }
        />
      )}
      {/* Both steps stay mounted, so a value typed on one is kept on the other. */}
      <div hidden={step !== 0}>
        <div className={PANEL}>
          <AccountDetailFields isNew rule={formValidation} />

          {!stepped && (
            <>
              <AccountAccessFields
                groupsDisabled={disabledFields?.groups}
                rule={formValidation}
                withOrg={false}
              />
              {errorNotice}
              <Form.Item className="flex justify-end">{submit}</Form.Item>
            </>
          )}
          {stepped && (
            <Form.Item className="flex justify-end">
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            </Form.Item>
          )}
        </div>
      </div>

      {stepped && (
        <div hidden={step !== 1}>
          <div className={PANEL}>
            <AccountAccessFields
              groupsDisabled={disabledFields?.groups}
              choice={choice}
              rule={formValidation}
            />
            {placement && <p className="mb-4 text-sm">{placement}</p>}
            {errorNotice}
            <Form.Item className="flex justify-end">{submit}</Form.Item>
          </div>
        </div>
      )}
    </Form>
  );
};
