import { AccountAccessFields } from '@/core/components/AccountFields';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { GenericErrorCard } from '@/core/components/GenericError';
import {
  chosenOrg,
  ORG_CHOICE_NAME,
  ORG_NAME,
  orgChoiceOf,
  type TOrgChoice,
} from '@/core/components/OrgChoiceFormItem';
import { ORG_ROLE_NAME } from '@/core/components/OrgRoleFormItem';
import {
  isOrgAccount,
  orgRoleGroup,
  orgRoleGroups,
  orgRoleOf,
  TOrgRole,
} from '@/core/helpers/orgRoles';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { useFetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import { TAccountUpdateRequestBody } from '@/Settings/hooks/accounts/useUpdateAccount/types';
import { Alert, Button, Spin } from 'antd';
import { useState } from 'react';

type UpdateAccountOrgFormValues = {
  groups?: string[];
  org?: string | null;
  org_choice?: TOrgChoice;
  org_role?: TOrgRole;
};

/** How an organisation reads in the confirmation: your organisation, or the customer's name. */
const orgLabel = (org: string, yourOrg: string | null | undefined) =>
  !org || org === yourOrg ? 'your organisation' : org;

/** The organisation an account is bound to, with its role there or its groups, saved on their own. Moving it to another organisation asks first. */
export const UpdateAccountOrgForm = ({
  error,
  isPending,
  onFinish,
  username,
}: {
  error: Error | null;
  isPending: boolean;
  onFinish: (values: TAccountUpdateRequestBody) => void;
  username: string;
}) => {
  const [form] = Form.useForm<UpdateAccountOrgFormValues>();
  const [pendingMove, setPendingMove] = useState<TAccountUpdateRequestBody>();
  const choice: TOrgChoice | undefined = Form.useWatch(ORG_CHOICE_NAME, form);
  // The initial choice tells your organisation from a customer's, so the form waits for it.
  const { data: yourOrg, isLoading: yourOrgLoading } =
    useFetchYourOrganisation();
  const {
    data: accountDetail,
    isLoading,
    error: fetchError,
  } = useFetchAccountDetail({ username });

  if (isLoading || yourOrgLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {username} organisation</p>
      </>
    );
  }

  if (fetchError) {
    return (
      <GenericErrorCard
        title="Error fetching account detail"
        description={fetchError.message}
      />
    );
  }

  if (!accountDetail) {
    return null;
  }

  const storedOrg = accountDetail.org ?? '';
  // Your organisation keeps the binding the account already names for it.
  const ownOrg = isOrgAccount(storedOrg, yourOrg?.name) ? '' : storedOrg;
  const leftGroups = isOrgAccount(storedOrg, yourOrg?.name)
    ? accountDetail.groups.filter(
        (group) => !orgRoleGroups(storedOrg).includes(group),
      )
    : accountDetail.groups;

  const handleFinish = (values: UpdateAccountOrgFormValues) => {
    const boundOrg = chosenOrg({
      choice: values.org_choice,
      org: values.org,
      ownOrg,
    });
    const body: TAccountUpdateRequestBody = isOrgAccount(
      boundOrg,
      yourOrg?.name,
    )
      ? {
          org: boundOrg,
          groups: [orgRoleGroup(boundOrg, values.org_role ?? 'viewer')],
        }
      : { org: boundOrg, groups: values.groups ?? [] };
    if (boundOrg === storedOrg) {
      onFinish(body);
      return;
    }
    setPendingMove(body);
  };

  const removed = accountDetail.groups.filter(
    (group) => !(pendingMove?.groups ?? []).includes(group),
  );

  return (
    <Form
      name={`update-account-org-form-${username}`}
      form={form}
      onFinish={handleFinish}
      onValuesChange={() => setPendingMove(undefined)}
      initialValues={{
        [ORG_CHOICE_NAME]: orgChoiceOf({
          allowsNone: false,
          org: storedOrg,
          yourOrg: yourOrg?.name ?? undefined,
        }),
        [ORG_NAME]: isOrgAccount(storedOrg, yourOrg?.name)
          ? storedOrg
          : undefined,
        [ORG_ROLE_NAME]: storedOrg
          ? orgRoleOf(storedOrg, accountDetail.groups)
          : 'viewer',
        groups: leftGroups,
      }}
    >
      <AccountAccessFields choice={choice} />

      {pendingMove && (
        <Form.Item>
          <Alert
            type="warning"
            showIcon
            message={`Move ${username} from ${orgLabel(storedOrg, yourOrg?.name)} to ${orgLabel(pendingMove.org ?? '', yourOrg?.name)}?`}
            description={
              removed.length > 0
                ? `It leaves ${removed.join(', ')}.`
                : 'It keeps every group it holds.'
            }
            action={
              <div className="flex flex-col gap-2">
                <Button
                  danger
                  loading={isPending}
                  onClick={() => onFinish(pendingMove)}
                >
                  Move account
                </Button>
                <Button onClick={() => setPendingMove(undefined)}>
                  Cancel
                </Button>
              </div>
            }
          />
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
          disabled={isPending || Boolean(pendingMove)}
          type="primary"
          htmlType="submit"
        >
          Update Organisation
        </Button>
      </Form.Item>
    </Form>
  );
};
