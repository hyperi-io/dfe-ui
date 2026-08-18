import { Form } from '@/core/components/Form';
import { OidcLoginPopup } from '@/core/components/OidcLoginPopup';
import { TFetchSetupStatusResponse } from '@/core/hooks/useFetchSetupStatus/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Select } from 'antd';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  provider: z.string().min(1, { message: 'Provider is required' }),
});
type FormData = z.infer<typeof formSchema>;

export const LoginWithOidcForm = ({
  oidc_providers,
}: {
  oidc_providers: TFetchSetupStatusResponse['oidc_providers'];
}) => {
  const [showOidcLoginPopup, setShowOidcLoginPopup] = useState(false);
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleSubmit = () => {
    setShowOidcLoginPopup(true);
  };
  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      initialValues={{ provider: oidc_providers?.[0]?.name ?? '' }}
    >
      <Form.Item name="provider" label="Provider" rules={[formValidation]}>
        <Select
          options={oidc_providers?.map((provider) => ({
            label: provider.display_name,
            value: provider.name,
          }))}
        />
      </Form.Item>

      {showOidcLoginPopup && (
        <OidcLoginPopup
          closePopup={() => setShowOidcLoginPopup(false)}
          oidcProviderName={form.getFieldValue('provider')}
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
