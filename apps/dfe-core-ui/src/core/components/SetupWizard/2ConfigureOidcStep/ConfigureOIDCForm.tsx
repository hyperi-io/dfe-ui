import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import {
  GROUP_MODE_OPTIONS,
  GROUPS_FORM_NAME,
  PROVIDERS,
  PROVIDERS_MAP,
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
}

export const ConfigureOIDCForm = ({
  form,
  error,
  ...props
}: ConfigureOidcProviderFormProps) => {
  const formValidation = useAntdZodResolver(createUpdateOidcProviderSchema);
  const typeWatch = Form.useWatch('type', form);
  const modeWatch = Form.useWatch(['groups', 'mode'], form);

  return (
    <Form
      form={form}
      className="gap-4 mt-6"
      {...props}
      initialValues={{
        enabled: true,
        client_secret_env: '',
        ...PROVIDERS_MAP['google']?.initialValues,
      }}
    >
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

      {typeWatch && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Name" name="name" rules={[formValidation]}>
              <Input />
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
              <Input.Password />
            </Form.Item>
          </div>

          <p className="font-medium mt-4">Groups</p>
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
                  label="API Token"
                  name={[GROUPS_FORM_NAME, 'api_token_env']}
                  rules={[formValidation]}
                >
                  <Input />
                </Form.Item>
              </>
            )}

            {typeWatch === 'google' && (
              <>
                <Form.Item
                  label="Admin Email"
                  name={[GROUPS_FORM_NAME, 'admin_email']}
                  rules={[formValidation]}
                >
                  <Input />
                </Form.Item>
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
                >
                  <Input />
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
                  label="Client Secret"
                  name={[GROUPS_FORM_NAME, 'client_secret_env']}
                  rules={[formValidation]}
                >
                  <Input />
                </Form.Item>
              </>
            )}

            {modeWatch === 'token_claim' && (
              <>
                <Form.Item
                  label="Claim Name"
                  name={[GROUPS_FORM_NAME, 'claim_name']}
                  rules={[formValidation]}
                >
                  <Input />
                </Form.Item>
              </>
            )}
            {modeWatch === 'api' && (
              <>
                <Form.Item
                  label="Sync Interval"
                  name={[GROUPS_FORM_NAME, 'sync_interval']}
                  rules={[formValidation]}
                >
                  <InputNumber className="w-full" />
                </Form.Item>
              </>
            )}
          </div>
        </>
      )}

      {error && (
        <FormNotification
          type="error"
          text={error.message ?? 'An unexpected error occurred'}
        />
      )}

      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit">
          Add OIDC Provider
        </Button>
      </Form.Item>
    </Form>
  );
};
