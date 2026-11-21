import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { Form } from '@/core/components/Form';
import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useIdpReauth } from '@/core/hooks/useIdpReauth';
import { type TReauthKind, useReauth } from '@/core/hooks/useReauth';
import { Button, Input } from 'antd';

type TReauthFormValues = { password: string };

const KIND_NOUNS: Record<TReauthKind, string> = {
  account: 'account',
  api_key: 'API key',
  group: 'group',
  provider: 'sign-in provider',
  role: 'role',
};

/** Asks the signed-in user to prove it is still them before it changes *target*: its password, or a fresh sign-in at its identity provider. Hands back the grant the engine signs for that one target. */
export const ReauthModal = ({
  kind = 'account',
  onCancel,
  onGranted,
  open,
  target,
}: {
  kind?: TReauthKind;
  onCancel: () => void;
  onGranted: (grant: string) => void;
  open: boolean;
  target: string;
}) => {
  const [form] = Form.useForm<TReauthFormValues>();
  const { data: me } = useAuthMe();
  const viaIdp = me?.external === true;
  const password = useReauth({
    onSuccess: (grant) => {
      form.resetFields();
      password.reset();
      onGranted(grant);
    },
  });
  const idp = useIdpReauth({ onGranted });
  const action = `change ${KIND_NOUNS[kind]}`;

  const handleCancel = () => {
    form.resetFields();
    password.reset();
    idp.reset();
    onCancel();
  };

  const cancel = <Button onClick={handleCancel}>Cancel</Button>;

  return (
    <Modal
      title="Confirm it's you"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      {viaIdp ? (
        <div className="flex flex-col gap-3">
          <p>
            Sign in again at your identity provider to {action}{' '}
            <strong>{target}</strong>.
          </p>
          {idp.error && <FormNotification type="error" text={idp.error} />}
          <div className="flex justify-end gap-2">
            {cancel}
            <Button
              type="primary"
              loading={idp.isPending}
              onClick={() => void idp.start({ kind, target })}
            >
              Sign in again
            </Button>
          </div>
        </div>
      ) : (
        <Form
          form={form}
          name={`reauth-form-${target}`}
          onFinish={({ password: value }) =>
            password.mutate({ kind, password: value, target })
          }
        >
          <p>
            Enter your password to {action} <strong>{target}</strong>.
          </p>
          <Form.Item
            name="password"
            label="Your password"
            rules={[{ required: true, message: 'Enter your password' }]}
          >
            <Input.Password autoComplete="current-password" autoFocus />
          </Form.Item>
          {password.error && <ApiErrorNotification error={password.error} />}
          <Form.Item className="flex justify-end">
            <div className="flex gap-2">
              {cancel}
              <Button
                type="primary"
                htmlType="submit"
                loading={password.isPending}
              >
                Confirm
              </Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};
