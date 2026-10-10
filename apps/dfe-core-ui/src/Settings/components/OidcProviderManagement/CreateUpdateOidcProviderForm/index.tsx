import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import {
  PROVIDERS,
  PROVIDERS_MAP,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { Button, FormProps, Input, Select, Switch } from 'antd';
import { GroupFormSection } from './GroupFormSection';

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
}

export const CreateUpdateOidcProviderForm = ({
  disabledFields,
  onFinish,
  hasReset = false,
  buttonLabel = 'Create',
  isPending = false,
  error,
  initialValues,
  ...props
}: CreateUpdateOidcProviderFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: CreateUpdateOidcProviderFormData) => {
    onFinish?.(values);
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
      }}
      onFinish={handleFinish}
    >
      <div className="flex gap-2">
        <Form.Item className="grow" label="Type" name="type">
          <Select
            disabled={disabledFields?.type}
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

      <>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Name" name="name">
            <Input disabled={disabledFields?.name} />
          </Form.Item>

          <Form.Item label="Display Name" name="display_name">
            <Input />
          </Form.Item>
          <Form.Item label="Issuer" name="issuer">
            <Input disabled={disabledFields?.issuer} />
          </Form.Item>
          <Form.Item label="Scopes" name="scopes">
            <Select
              mode="tags"
              // An emptied edit keeps the stored scopes, so no default hint.
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
          >
            <Input />
          </Form.Item>
          <Form.Item label="Client ID" name="client_id">
            <Input />
          </Form.Item>
          <Form.Item
            label="Client Secret Environment Variable"
            name="client_secret_env"
          >
            <Input />
          </Form.Item>
          <Form.Item label="Client Secret" name="client_secret">
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </div>

        <GroupFormSection />
      </>

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
