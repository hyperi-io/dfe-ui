'use client';

import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { OIDC_LINK_PROVIDER_ID } from '@/core/config/oidcToken.constants';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;

const WRONG_PASSWORD = 'That password is not right for this account.';

// Refusals the user can answer by trying again here. Any other code ends the link step.
const RETRYABLE: Record<string, string> = {
  CredentialsSignin: WRONG_PASSWORD,
  unauthorized: WRONG_PASSWORD,
  too_many_attempts: 'Too many failed attempts. Wait a minute and try again.',
};

/**
 * The link step: the IdP sign-in's email matched a local DFE account, which it joins once that account's password is given.
 */
export const OidcLinkForm = ({
  account,
  onLinked,
  onRefused,
  ticket,
}: {
  account: string;
  onLinked: () => void;
  /** Called with the engine's code for a refusal another password cannot fix. */
  onRefused: (code: string) => void;
  ticket: string;
}) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async ({ password }: FormData) => {
    setPending(true);
    setError(null);
    try {
      const res = await signIn(OIDC_LINK_PROVIDER_ID, {
        password,
        redirect: false,
        ticket,
      });
      if (res && !res.error) {
        onLinked();
        return;
      }
      const code = res?.error ?? 'unauthorized';
      if (Object.hasOwn(RETRYABLE, code)) {
        setError(RETRYABLE[code] ?? WRONG_PASSWORD);
      } else {
        onRefused(code);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <p>
        Your identity provider&apos;s email matches the DFE account{' '}
        <strong>{account}</strong>. Enter that account&apos;s password to link
        them. After that, your identity provider signs you straight in.
      </p>
      <Form
        className="w-full"
        form={form}
        initialValues={{ password: '' }}
        onFinish={onSubmit}
        onValuesChange={() => setError(null)}
      >
        <Form.Item name="password" label="Password" rules={[formValidation]}>
          <Input.Password placeholder="Password" autoFocus />
        </Form.Item>
        {error && <FormNotification text={error} type="error" />}
        <Button
          loading={pending}
          type="primary"
          htmlType="submit"
          className="ml-auto"
        >
          Link and sign in
        </Button>
      </Form>
    </div>
  );
};
