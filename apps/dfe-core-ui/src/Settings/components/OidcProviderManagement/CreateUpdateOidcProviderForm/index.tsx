import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { CredentialField } from '@/core/components/CredentialField';
import { Form } from '@/core/components/Form';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import { presetFieldsForType } from '@/core/utils/oidcProviderPresets';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { Button, FormProps, Input, Select, Switch } from 'antd';
import { GroupFormSection } from './GroupFormSection';
import { IssuerField, useIssuerBuilder } from './IssuerField';

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
  const issuerBuilder = useIssuerBuilder({ form });

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
              form.setFieldsValue(
                presetFieldsForType({
                  current: form.getFieldsValue(true),
                  type: value,
                }),
              );
              issuerBuilder.changeType(value);
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
          <IssuerField
            builder={issuerBuilder}
            disabled={disabledFields?.issuer}
          />
          <CredentialField
            label="Client ID"
            valueName="client_id"
            envName="client_id_env"
          />
          <CredentialField
            label="Client Secret"
            valueName="client_secret"
            envName="client_secret_env"
            storedName="client_secret_path"
            secret
          />
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
