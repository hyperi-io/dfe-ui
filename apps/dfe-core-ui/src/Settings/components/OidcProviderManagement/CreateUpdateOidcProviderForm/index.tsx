import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/Settings/components/OidcProviderManagement/constants/providers.constants';
import { Button, FormProps, Input, Select, Switch } from 'antd';
import { GroupFormSection } from './GroupFormSection';
import { CreateUpdateOidcProviderFormData } from './providers.schema';

interface CreateUpdateOidcProviderFormProps extends FormProps {
  disabledFields?: {
    type?: boolean;
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

  const typeWatch = Form.useWatch('type', form);
  const modeWatch = Form.useWatch(['groups', 'mode'], form);

  return (
    <Form
      form={form}
      className="gap-4"
      {...props}
      initialValues={{
        enabled: true,
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
          </div>

          <GroupFormSection type={typeWatch} mode={modeWatch} />
        </>
      )}

      {error && (
        <FormNotification
          type="error"
          text={error.message ?? 'An unexpected error occurred'}
        />
      )}

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
