import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import {
  OidcGroupFields,
  OidcLoginFields,
  useOidcProviderTypeChange,
} from '@/core/components/OidcProviderFields';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { trustableEmailDomain } from '@/core/helpers/oidcProviders.helpers';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useApiFieldErrors } from '@/core/hooks/useApiFieldErrors';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  buildOidcProviderSchema,
  CreateUpdateOidcProviderFormData,
} from '@/core/validationSchemas/oidcProviders.schema';
import { useOrganisationLabels } from '@/Settings/hooks/organisations/useOrganisationLabels';
import { Button, FormProps, Input, Select, Switch } from 'antd';
import { useMemo } from 'react';

/** Where a provider's organisation comes from: yours, a customer's picked in the form, or the stored one an edit shows and keeps. */
export type TProviderOrgScope = 'customer' | 'stored' | 'yours';

interface CreateUpdateOidcProviderFormProps extends FormProps {
  disabledFields?: {
    name?: boolean;
    type?: boolean;
    issuer?: boolean;
  };
  hasReset?: boolean;
  buttonLabel?: string;
  isPending: boolean;
  error: Error | null;
  onFinish: (values: CreateUpdateOidcProviderFormData) => void;
  /** A domain to offer while Trusted Email Domains is empty. */
  suggestedDomain?: string;
  orgScope: TProviderOrgScope;
}

const ORG_HINTS: Record<TProviderOrgScope, string> = {
  customer: "Signs in this organisation's accounts, not yours.",
  stored:
    'A provider stays in its organisation. To move it, delete it and create it again.',
  yours: "Signs in your organisation's accounts.",
};

/** The org a your-organisation provider is created in: an org admin's own, else none, which signs people into yours. */
const useYourProviderOrg = () => useAdministeredOrg() ?? '';

/** The provider's organisation: a required picker for a customer's, else the organisation shown read-only. */
const ProviderOrgField = ({
  scope,
  storedOrg,
}: {
  scope: TProviderOrgScope;
  storedOrg: string;
}) => {
  const yourProviderOrg = useYourProviderOrg();
  const { data: yourOrg } = useFetchYourOrganisation();
  const { isYours, orgLabel, yourLabel } = useOrganisationLabels();

  if (scope === 'customer') {
    return (
      <Form.Item
        name="org"
        label="Organisation"
        extra={ORG_HINTS.customer}
        rules={[{ required: true, message: 'Select an organisation' }]}
      >
        <OrganisationSelect
          aria-label="Organisation"
          currentOrganisation={yourOrg?.name ?? undefined}
          placeholder="Pick an organisation"
        />
      </Form.Item>
    );
  }
  const org = scope === 'yours' ? yourProviderOrg : storedOrg;
  return (
    <Form.Item label="Organisation" extra={ORG_HINTS[scope]}>
      <Input
        aria-label="Organisation"
        disabled
        value={
          isYours(org) ? `${yourLabel} (your organisation)` : orgLabel(org)
        }
      />
    </Form.Item>
  );
};

export const CreateUpdateOidcProviderForm = ({
  disabledFields,
  onFinish,
  hasReset = false,
  buttonLabel = 'Create',
  isPending = false,
  error,
  initialValues,
  orgScope,
  suggestedDomain,
  ...props
}: CreateUpdateOidcProviderFormProps) => {
  const [form] = Form.useForm();
  const yourProviderOrg = useYourProviderOrg();
  const { changeType, issuerBuilder } = useOidcProviderTypeChange({ form });
  useApiFieldErrors({ error, form });
  const loginSecretPath = initialValues?.client_secret_path;
  const apiTokenPath = initialValues?.groups?.api_token_path;
  const directorySecretPath = initialValues?.groups?.client_secret_path;
  const schema = useMemo(
    () =>
      buildOidcProviderSchema({
        client_secret_path: loginSecretPath,
        groups: {
          api_token_path: apiTokenPath,
          client_secret_path: directorySecretPath,
        },
      }),
    [loginSecretPath, apiTokenPath, directorySecretPath],
  );
  const formValidation = useAntdZodResolver(schema);

  // A customer's org is a field of its own, and an edit sends none, so it never moves.
  const handleFinish = (values: CreateUpdateOidcProviderFormData) =>
    onFinish(
      orgScope === 'yours' ? { ...values, org: yourProviderOrg } : values,
    );

  return (
    <Form
      form={form}
      className="gap-4"
      {...props}
      initialValues={{
        enabled: true,
        client_secret_env: '',
        ...PROVIDERS_MAP['google']?.initialValues,
        ...initialValues,
      }}
      onFinish={handleFinish}
    >
      <ProviderOrgField scope={orgScope} storedOrg={initialValues?.org ?? ''} />

      <div className="flex gap-2">
        <Form.Item
          className="grow"
          label="Type"
          name="type"
          rules={[formValidation]}
        >
          <Select
            disabled={disabledFields?.type}
            options={PROVIDERS.map((provider) => ({
              label: provider.name,
              value: provider.key,
            }))}
            onChange={changeType}
          />
        </Form.Item>
        <Form.Item
          className="w-20"
          label="Enabled"
          name="enabled"
          rules={[formValidation]}
        >
          <Switch />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <OidcLoginFields
          rule={formValidation}
          issuerBuilder={issuerBuilder}
          disabledFields={disabledFields}
          hasStoredScopes={!!initialValues?.scopes?.length}
          suggestedDomain={suggestedDomain}
          suggestsNames={!disabledFields?.name}
        />
      </div>

      <section className="flex flex-col gap-2" aria-label="Groups">
        <h2 className="font-medium">Groups</h2>
        <div className="grid grid-cols-2 gap-4">
          <OidcGroupFields
            rule={formValidation}
            derivesFromIssuer={!disabledFields?.issuer}
          />
        </div>
      </section>

      {error && <ApiErrorNotification error={error} />}

      <Form.Item className="flex justify-end col-span-2">
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

/** The provider form a drawer shows, offering the signed-in account's email domain as a trusted domain. */
export const OidcProviderDrawerForm = (
  props: Omit<CreateUpdateOidcProviderFormProps, 'suggestedDomain'>,
) => {
  const { data: currentUser } = useFetchCurrentUser();
  return (
    <CreateUpdateOidcProviderForm
      {...props}
      suggestedDomain={trustableEmailDomain(currentUser?.email)}
    />
  );
};
