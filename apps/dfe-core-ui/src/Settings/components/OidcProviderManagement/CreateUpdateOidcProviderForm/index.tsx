import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  chosenOrg,
  ORG_CHOICE_NAME,
  OrgChoiceFormItem,
  orgChoiceOf,
  type TOrgChoice,
} from '@/core/components/OrgChoiceFormItem';
import {
  OidcGroupFields,
  OidcLoginFields,
  useOidcProviderTypeChange,
} from '@/core/components/OidcProviderFields';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { trustableEmailDomain } from '@/core/helpers/oidcProviders.helpers';
import { useApiFieldErrors } from '@/core/hooks/useApiFieldErrors';
import { useFetchCurrentUser } from '@/core/hooks/useFetchCurrentUser';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  buildOidcProviderSchema,
  CreateUpdateOidcProviderFormData,
} from '@/core/validationSchemas/oidcProviders.schema';
import { Button, FormProps, Select, Switch } from 'antd';
import { useMemo } from 'react';

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
}

const PROVIDER_ORG_CHOICES: readonly TOrgChoice[] = ['none', 'customer'];

export const CreateUpdateOidcProviderForm = ({
  disabledFields,
  onFinish,
  hasReset = false,
  buttonLabel = 'Create',
  isPending = false,
  error,
  initialValues,
  suggestedDomain,
  ...props
}: CreateUpdateOidcProviderFormProps) => {
  const [form] = Form.useForm();
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

  const handleFinish = ({
    org_choice,
    ...values
  }: CreateUpdateOidcProviderFormData & { org_choice?: TOrgChoice }) => {
    onFinish?.({
      ...values,
      org: chosenOrg({ choice: org_choice, org: values.org, ownOrg: '' }),
    });
  };

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
        // A new provider's organisation is picked on purpose, never defaulted.
        ...(initialValues?.name
          ? {
              [ORG_CHOICE_NAME]: orgChoiceOf({
                allowsNone: true,
                org: initialValues.org,
                yourOrg: undefined,
              }),
            }
          : {}),
      }}
      onFinish={handleFinish}
    >
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

      <OrgChoiceFormItem
        choices={PROVIDER_ORG_CHOICES}
        noneLabel="Platform provider: signs in your organisation's accounts"
      />

      <div className="grid grid-cols-2 gap-4">
        <OidcLoginFields
          rule={formValidation}
          issuerBuilder={issuerBuilder}
          disabledFields={disabledFields}
          hasStoredScopes={!!initialValues?.scopes?.length}
          suggestedDomain={suggestedDomain}
        />
      </div>

      <SimpleCollapse
        title="Groups"
        classNames={{
          // No side padding, so the group fields line up with the fields above.
          container: 'px-0',
          content: 'grid grid-cols-2 gap-4',
        }}
        defaultOpen={true}
      >
        <OidcGroupFields
          rule={formValidation}
          derivesFromIssuer={!disabledFields?.issuer}
        />
      </SimpleCollapse>

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
