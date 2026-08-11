import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card, Input } from 'antd';
import z from 'zod';

const formSchema = z.object({
  new_password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;
export const ResetBreakGlassAccount = ({
  isAdminReset,
  goNext,
  goPrevious,
}: {
  isAdminReset: boolean;
  goNext: () => void;
  goPrevious: () => void;
}) => {
  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);
  const {
    mutate: resetBreakGlassAccount,
    isPending,
    error,
  } = useAccountResetPassword({
    username: 'admin',
    onSuccess: () => {
      goNext();
    },
  });
  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Reset Break Glass Account</h1>

      {isAdminReset ? (
        <NotificationCard
          title="Default admin account password has been successfully reset."
          type="success"
        />
      ) : (
        <>
          <NotificationCard
            title="We have created an emergency account in case you lose access to or delete your primary account."
            description={
              <>
                <p>
                  The account currently has the default password set. Please
                  update it to a more secure password.
                </p>
                <p>
                  Make sure that you store this password in a secure location
                  and be careful not to lose it.
                </p>
              </>
            }
          />
          <Form form={form} onFinish={resetBreakGlassAccount}>
            <Form.Item
              name="new_password"
              label="New Password"
              rules={[formValidation]}
            >
              <Input.Password />
            </Form.Item>

            {error && (
              <NotificationCard
                title="Error"
                description={error.message}
                type="error"
              />
            )}

            <Form.Item className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={isPending}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <div className="flex flex-row justify-between mt-10">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <div className="flex flex-row gap-6">
          {isAdminReset && (
            <Button
              type="text"
              className="text-light p-0 pl-2"
              onClick={goNext}
            >
              Next <IconArrowRight />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
