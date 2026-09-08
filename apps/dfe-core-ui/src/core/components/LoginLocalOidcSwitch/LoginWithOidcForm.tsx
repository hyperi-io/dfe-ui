import { Form } from '@/core/components/Form';
import { OidcLoginPopup } from '@/core/components/OidcLoginPopup';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Checkbox, Select } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  provider: z.string().min(1, { message: 'Provider is required' }),
  remember_selected_provider: z.boolean().default(false),
});
type FormData = z.infer<typeof formSchema>;

export const LoginWithOidcForm = ({
  oidc_providers,
  callbackUrl = '/',
}: {
  oidc_providers: TFetchSetupStatusResponse['oidc_providers'];
  callbackUrl?: string;
}) => {
  const [showOidcLoginPopup, setShowOidcLoginPopup] = useState(false);
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const localSelectedProvider = localStorage.getItem('dfe_provider');
  const selectedProvider =
    localSelectedProvider &&
    oidc_providers?.find((provider) => provider.name === localSelectedProvider)
      ?.name;

  const handleSubmit = (values: FormData) => {
    if (values.remember_selected_provider) {
      localStorage.setItem('dfe_provider', values.provider);
    }
    setShowOidcLoginPopup(true);
  };
  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={{
        provider: selectedProvider ?? oidc_providers?.[0]?.name ?? '',
        remember_selected_provider: false,
      }}
    >
      <Form.Item name="provider" label="Provider" rules={[formValidation]}>
        <Select
          onChange={() => {
            setShowOidcLoginPopup(false);
          }}
          options={oidc_providers?.map((provider) => ({
            label: provider.display_name,
            value: provider.name,
          }))}
        />
      </Form.Item>

      <Form.Item name="remember_selected_provider" valuePropName="checked">
        <Checkbox>Remember Selected Provider</Checkbox>
      </Form.Item>

      {showOidcLoginPopup && (
        <OidcLoginPopup
          closePopup={() => setShowOidcLoginPopup(false)}
          oidcProviderName={form.getFieldValue('provider')}
          callbackUrl={callbackUrl}
        />
      )}

      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};
