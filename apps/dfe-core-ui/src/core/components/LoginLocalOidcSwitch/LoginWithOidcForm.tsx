import { Form } from '@/core/components/Form';
import { OidcLoginPopup } from '@/core/components/OidcLoginPopup';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Checkbox, Select } from 'antd';
import { useState } from 'react';
import z from 'zod';
import {
  readLoginChoice,
  REMEMBER_LABEL,
  rememberLoginChoice,
} from './loginChoice';

const formSchema = z.object({
  provider: z.string().min(1, { message: 'Provider is required' }),
  remember: z.boolean().default(false),
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

  const choice = readLoginChoice();
  const selectedProvider =
    choice?.method === 'oidc'
      ? oidc_providers?.find((provider) => provider.name === choice.provider)
          ?.name
      : undefined;

  // The box starts ticked for a remembered provider, so logging in unticked forgets it.
  const handleSubmit = (values: FormData) => {
    rememberLoginChoice(
      values.remember ? { method: 'oidc', provider: values.provider } : null,
    );
    setShowOidcLoginPopup(true);
  };
  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={{
        provider: selectedProvider ?? oidc_providers?.[0]?.name ?? '',
        remember: Boolean(selectedProvider),
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

      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>{REMEMBER_LABEL}</Checkbox>
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
