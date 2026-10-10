import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  GOOGLE_SERVICE_ACCOUNT_HINT,
  GROUP_MODE_OPTIONS,
  GROUPS_FORM_NAME,
  PROVIDERS,
  PROVIDERS_MAP,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  CreateUpdateOidcProviderFormData,
  createUpdateOidcProviderSchema,
} from '@/core/validationSchemas/oidcProviders.schema';
import {
  Button,
  FormInstance,
  FormProps,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'antd';

interface ConfigureOidcProviderFormProps extends FormProps {
  error: Error | null;
  form: FormInstance<CreateUpdateOidcProviderFormData>;
  isSubmitting: boolean;
  submitButtonLabel?: string;
  hasReset?: boolean;
  disabledFields?: {
    name?: boolean;
  };
}

export const ConfigureOIDCForm = ({
  form,
  error,
  initialValues,
  isSubmitting,
  submitButtonLabel = 'Add OIDC Provider',
  hasReset = false,
  disabledFields = {},
  ...props
}: ConfigureOidcProviderFormProps) => {
  const formValidation = useAntdZodResolver(createUpdateOidcProviderSchema);
  const typeWatch = Form.useWatch('type', form);
  // Uncomment this when we have a way to handle the mode watch
  // for different field per oidc provider type
  // const modeWatch = Form.useWatch(['groups', 'mode'], form);

  return (
    <Form
      form={form}
      classNames={{ root: 'mt-2', content: 'flex flex-row gap-4' }}
      {...props}
      initialValues={{
        enabled: true,
        client_secret_env: '',
        ...PROVIDERS_MAP['google']?.initialValues,
        ...initialValues,
      }}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-2 w-[47%]">
          <p className="font-medium">OIDC Provider</p>
          <div className="flex gap-2">
            <Form.Item
              className="grow"
              label="Type"
              name="type"
              rules={[formValidation]}
            >
              <Select
                options={PROVIDERS.map((provider) => ({
                  label: provider.name,
                  value: provider.key,
                }))}
                onChange={(value) => {
                  form.setFieldsValue({
                    ...PROVIDERS_MAP[value]?.initialValues,
                  });
                }}
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
            <Form.Item label="Name" name="name" rules={[formValidation]}>
              <Input disabled={disabledFields.name} />
            </Form.Item>

            <Form.Item
              label="Display Name"
              name="display_name"
              rules={[formValidation]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Issuer" name="issuer" rules={[formValidation]}>
              <Input />
            </Form.Item>
            <Form.Item label="Scopes" name="scopes" rules={[formValidation]}>
              <Select
                mode="tags"
                // An emptied update keeps the stored scopes: no default hint.
                placeholder={
                  initialValues?.scopes?.length ? undefined : SCOPES_PLACEHOLDER
                }
                tokenSeparators={[' ', ',']}
                open={false}
                suffixIcon={null}
              />
            </Form.Item>
            <Form.Item
              label="Client ID Environment Variable"
              name="client_id_env"
              rules={[formValidation]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Client Secret Environment Variable"
              name="client_secret_env"
              rules={[formValidation]}
            >
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="grow max-w-px bg-gray-200" />

        {typeWatch && (
          <div className="flex flex-col gap-2 w-[47%]">
            <p className="font-medium">Groups</p>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Mode"
                name={[GROUPS_FORM_NAME, 'mode']}
                rules={[formValidation]}
              >
                <Select options={GROUP_MODE_OPTIONS} />
              </Form.Item>

              <Form.Item
                label="Enrich on Login"
                name={[GROUPS_FORM_NAME, 'enrich_on_login']}
                rules={[formValidation]}
              >
                <Switch />
              </Form.Item>

              {typeWatch === 'okta' && (
                <>
                  <Form.Item
                    label="Okta Domain"
                    name={[GROUPS_FORM_NAME, 'okta_domain']}
                    rules={[formValidation]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="API Token Environment Variable"
                    name={[GROUPS_FORM_NAME, 'api_token_env']}
                    rules={[formValidation]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="API Token"
                    name={[GROUPS_FORM_NAME, 'api_token']}
                    rules={[formValidation]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </>
              )}

              {typeWatch === 'google' && (
                <>
                  <Form.Item
                    label="Domain"
                    name={[GROUPS_FORM_NAME, 'domain']}
                    rules={[formValidation]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Service Account JSON ENV"
                    name={[GROUPS_FORM_NAME, 'service_account_json_env']}
                    rules={[formValidation]}
                    extra={GOOGLE_SERVICE_ACCOUNT_HINT}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Service Account JSON"
                    name={[GROUPS_FORM_NAME, 'service_account_json']}
                    rules={[formValidation]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </>
              )}

              {typeWatch === 'entra_id' && (
                <>
                  <Form.Item
                    label="Tenant ID"
                    name={[GROUPS_FORM_NAME, 'tenant_id_env']}
                    rules={[formValidation]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Client Secret ENV"
                    name={[GROUPS_FORM_NAME, 'client_secret_env']}
                    rules={[formValidation]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Client Secret"
                    name={[GROUPS_FORM_NAME, 'client_secret']}
                    rules={[formValidation]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </>
              )}

              <Form.Item
                label="Claim Name"
                name={[GROUPS_FORM_NAME, 'claim_name']}
                rules={[formValidation]}
              >
                <Input />
              </Form.Item>

              <>
                <Form.Item
                  label="Sync Interval"
                  name={[GROUPS_FORM_NAME, 'sync_interval']}
                  rules={[formValidation]}
                >
                  <InputNumber className="w-full" />
                </Form.Item>
              </>
            </div>
          </div>
        )}
      </div>

      {error && <ApiErrorNotification error={error} />}

      <Form.Item className="flex justify-end">
        {hasReset && (
          <Button type="default" htmlType="reset">
            Reset Form
          </Button>
        )}
        <Button type="primary" htmlType="submit" loading={isSubmitting}>
          {submitButtonLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};
