import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import {
  GROUP_MODE_OPTIONS,
  GROUPS_FORM_NAME,
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { FormProps, Input, InputNumber, Select, Switch } from 'antd';
import { CreateUpdateOidcProviderFormData } from './providers.schema';

interface ConfigureOidcProviderFormProps extends FormProps {
  error: Error | null;
  onFinish: (values: CreateUpdateOidcProviderFormData) => void;
}

export const ConfigureOIDCForm = ({
  onFinish,
  error,
  initialValues,
  ...props
}: ConfigureOidcProviderFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    onFinish?.(values);
  };

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
        ...initialValues,
      }}
      onFinish={handleFinish}
    >
      <div className="flex gap-2">
        <Form.Item className="grow" label="Type" name="type">
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
        <Form.Item className="w-20" label="Enabled" name="enabled">
          <Switch />
        </Form.Item>
      </div>

      {typeWatch && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>

            <Form.Item label="Display Name" name="display_name">
              <Input />
            </Form.Item>
            <Form.Item label="Issuer" name="issuer">
              <Input />
            </Form.Item>
            <Form.Item
              label="Client ID Environment Variable"
              name="client_id_env"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Client Secret Environment Variable"
              name="client_secret_env"
            >
              <Input.Password />
            </Form.Item>
          </div>

          <p className="font-medium mt-4">Groups</p>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Mode" name={[GROUPS_FORM_NAME, 'mode']}>
              <Select options={GROUP_MODE_OPTIONS} />
            </Form.Item>

            <Form.Item
              label="Enrich on Login"
              name={[GROUPS_FORM_NAME, 'enrich_on_login']}
            >
              <Switch />
            </Form.Item>

            {typeWatch === 'okta' && (
              <>
                <Form.Item
                  label="Okta Domain"
                  name={[GROUPS_FORM_NAME, 'okta_domain']}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="API Token"
                  name={[GROUPS_FORM_NAME, 'api_token_env']}
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
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Domain" name={[GROUPS_FORM_NAME, 'domain']}>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Service Account JSON ENV"
                  name={[GROUPS_FORM_NAME, 'service_account_json_env']}
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
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Client Secret"
                  name={[GROUPS_FORM_NAME, 'client_secret_env']}
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
    </Form>
  );
};
