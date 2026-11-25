import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useIdpReauth } from '@/core/hooks/useIdpReauth';
import { type TReauthKind, useReauth } from '@/core/hooks/useReauth';
import { Button, Input } from 'antd';
import type { ReactNode } from 'react';

type TReauthFormValues = { password: string };

/** Says what a change does, then takes the signed-in user's password, or a fresh sign-in at its identity provider, and hands back the grant the engine signs for *target*. */
export const ReauthPanel = ({
  children,
  confirmLabel,
  danger = false,
  error,
  isPending = false,
  kind,
  onCancel,
  onGranted,
  target,
}: {
  children: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  error?: Error | null;
  isPending?: boolean;
  kind: TReauthKind;
  onCancel: () => void;
  onGranted: (grant: string) => void;
  target: string;
}) => {
  const [form] = Form.useForm<TReauthFormValues>();
  const { data: me } = useAuthMe();
  const password = useReauth({
    onSuccess: (grant) => {
      form.resetFields();
      password.reset();
      onGranted(grant);
    },
  });
  const idp = useIdpReauth({ onGranted });

  const handleCancel = () => {
    form.resetFields();
    password.reset();
    idp.reset();
    onCancel();
  };

  const changeError = error && (
    <FormNotification type="error" text={error.message} />
  );
  const cancel = <Button onClick={handleCancel}>Cancel</Button>;

  if (me?.external === true) {
    return (
      <div className="flex flex-col gap-3">
        {children}
        <p>Sign in again at your identity provider to confirm.</p>
        {idp.error && <FormNotification type="error" text={idp.error} />}
        {changeError}
        <div className="flex justify-end gap-2">
          {cancel}
          <Button
            danger={danger}
            type="primary"
            loading={idp.isPending || isPending}
            onClick={() => void idp.start({ kind, target })}
          >
            {confirmLabel ?? 'Sign in again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form
      form={form}
      name={`reauth-form-${target}`}
      onFinish={({ password: value }) =>
        password.mutate({ kind, password: value, target })
      }
    >
      {children}
      <Form.Item
        name="password"
        label="Your password"
        rules={[{ required: true, message: 'Enter your password' }]}
      >
        <Input.Password autoComplete="current-password" autoFocus />
      </Form.Item>
      {password.error && <ApiErrorNotification error={password.error} />}
      {changeError}
      <Form.Item className="flex justify-end">
        <div className="flex gap-2">
          {cancel}
          <Button
            danger={danger}
            type="primary"
            htmlType="submit"
            loading={password.isPending || isPending}
          >
            {confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};
