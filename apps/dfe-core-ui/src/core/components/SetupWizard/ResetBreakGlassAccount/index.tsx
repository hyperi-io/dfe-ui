import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import { BREAK_GLASS_ADMIN_USERNAME } from '@/core/components/SetupWizard/constants';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import {
  QUERY_KEY_SETUP_STATUS,
  useFetchSetupStatus,
} from '@/core/hooks/useFetchSetupStatus';
import { TBreakGlass } from '@/core/hooks/useFetchSetupStatus/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  new_password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;
export const ResetBreakGlassAccount = ({
  isAdminReset,
  goNext,
  goPrevious,
  breakGlass: breakGlassServerResponse,
}: {
  isAdminReset: boolean;
  goNext: () => void;
  goPrevious: () => void;
  breakGlass: TBreakGlass | null;
}) => {
  const queryClient = useQueryClient();
  const [fetchingSetupStatus, setFetchingSetupStatus] = useState(false);

  const { data: { break_glass: breakGlassState } = {} } = useFetchSetupStatus({
    queryEnabled: fetchingSetupStatus,
    refetchInterval: 5 * 60 * 1000, //  5 minutes
  });

  const {
    data: { git } = {},
    mutate: resetBreakGlassAccount,
    isPending,
    error,
  } = useAccountResetPassword({
    username: BREAK_GLASS_ADMIN_USERNAME,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_SETUP_STATUS(),
      });
      setFetchingSetupStatus(true);
    },
  });

  const gitBackedEnabled =
    breakGlassState?.enabled ?? breakGlassServerResponse?.enabled;
  const autoMergeEnabled =
    breakGlassState?.auto_merge ?? breakGlassServerResponse?.auto_merge;
  const isMerged = breakGlassState?.merged;
  const pendingMerge =
    !!git?.pending ||
    !!breakGlassState?.pending ||
    !!breakGlassServerResponse?.pending;

  const pendingMergePrUrl =
    git?.pending?.pr_url ??
    breakGlassState?.pending?.pr_url ??
    breakGlassServerResponse?.pending?.pr_url;
  const pendingMergeCommand =
    git?.pending?.command ??
    breakGlassState?.pending?.command ??
    breakGlassServerResponse?.pending?.command;
  const pendingMergeBranch =
    git?.pending?.branch ??
    breakGlassState?.pending?.branch ??
    breakGlassServerResponse?.pending?.branch;

  const [form] = Form.useForm<FormData>();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  useEffect(() => {
    if (isMerged) {
      goNext();
    }
  }, [isMerged, goNext]);

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

          {!autoMergeEnabled && gitBackedEnabled && (
            <NotificationCard
              title="Auto Merge is not enabled"
              description="You will need to manually merge the emergency account in the configuration repository."
              type="warning"
            />
          )}

          {isMerged && (
            <NotificationCard
              title="Emergency account has been merged"
              type="success"
            />
          )}

          {pendingMerge && (
            <NotificationCard
              classNames={{
                container: 'w-full',
              }}
              title={
                <span className="flex gap-2 items-center font-semibold">
                  <Spin size="small" />
                  Emergency account is pending merge
                </span>
              }
              description={
                <div className="flex flex-col gap-2">
                  <p>
                    Actions are required on branch:{' '}
                    <span className="font-medium">{pendingMergeBranch}</span>
                  </p>
                  {pendingMergePrUrl && (
                    <p className="text-sm text-gray-500">
                      Please review the pending merge request and commit it.
                      <a
                        className="hover:underline"
                        href={pendingMergePrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {pendingMergePrUrl}
                      </a>
                    </p>
                  )}

                  {breakGlassState?.pending?.command && (
                    <>
                      <p className="text-sm text-gray-500">
                        Please run the following command to merge the emergency
                        account.
                      </p>
                      <CopyCodeBlock
                        className="w-full"
                        code={pendingMergeCommand ?? ''}
                      />
                    </>
                  )}
                </div>
              }
              type="info"
            />
          )}

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

      <div className="flex flex-row justify-between mt-2">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <div className="flex flex-row items-center gap-6">
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
