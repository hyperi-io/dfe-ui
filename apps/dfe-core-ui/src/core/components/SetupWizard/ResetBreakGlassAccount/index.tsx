import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { Form } from '@/core/components/Form';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  BREAK_GLASS_PASSWORD_ENV,
  BREAK_GLASS_USERNAME,
} from '@/core/components/SetupWizard/constants';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useAccountResetPassword } from '@/core/hooks/useAccountResetPassword';
import {
  QUERY_KEY_SETUP_STATUS,
  useFetchSetupStatus,
} from '@/core/hooks/useFetchSetupStatus';
import { TBreakGlass } from '@/core/hooks/useFetchSetupStatus/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { IconArrowLeft, IconArrowRight, IconRefresh } from '@repo/dfe-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Spin } from 'antd';
import { useEffect, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
  new_password: z.string().min(1, { message: 'Password is required' }),
});
type FormData = z.infer<typeof formSchema>;
const RETRY_INTERVAL_SECONDS = 10;

const PendingMergeRetryCountdown = ({
  intervalSeconds,
}: {
  intervalSeconds: number;
}) => {
  const [secondsUntilRetry, setSecondsUntilRetry] = useState(intervalSeconds);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setSecondsUntilRetry((remaining) =>
        remaining <= 1 ? intervalSeconds : remaining - 1,
      );
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalSeconds]);

  return `(Retrying in ${secondsUntilRetry} seconds...)`;
};

export const ResetBreakGlassAccount = ({
  goNext,
  goPrevious,
  breakGlass: breakGlassServerResponse,
}: {
  goNext: () => void;
  goPrevious: () => void;
  breakGlass: TBreakGlass | null;
}) => {
  const queryClient = useQueryClient();
  const [fetchingSetupStatus, setFetchingSetupStatus] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const {
    data: { break_glass: breakGlassState } = {},
    refetch: refetchSetupStatus,
  } = useFetchSetupStatus({
    queryEnabled: fetchingSetupStatus,
    refetchInterval: RETRY_INTERVAL_SECONDS * 1000,
  });

  const {
    data: { git } = {},
    mutate: resetBreakGlassAccount,
    isPending,
    error,
  } = useAccountResetPassword({
    username: BREAK_GLASS_USERNAME,
    onSuccess: () => {
      setPasswordReset(true);
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

  return (
    <Card
      classNames={{
        root: 'w-2/3',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Reset Break Glass Account</h1>

      {passwordReset ? (
        <NotificationCard
          title={`The ${BREAK_GLASS_USERNAME} account password has been reset until the next engine restart.`}
          description={`To change it for good, set ${BREAK_GLASS_PASSWORD_ENV} in the deployment and re-seed.`}
          type="success"
        />
      ) : (
        <>
          <NotificationCard
            title={`We have created an emergency account, ${BREAK_GLASS_USERNAME}, in case you lose access to or delete your primary account.`}
            description={
              <>
                <p>
                  It was minted with your deployment&apos;s own password, which
                  you can keep by skipping this step.
                </p>
                <p>
                  A password set here holds until the next engine restart, which
                  reconciles the account from the hash committed on its first
                  boot. The durable path is {BREAK_GLASS_PASSWORD_ENV} in the
                  deployment.
                </p>
                <p>
                  Either way, store it somewhere you can reach when the rest of
                  this system is unreachable.
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
                <div className="flex flex-row justify-between items-center">
                  <span className="flex gap-2 items-center">
                    <span className="flex gap-2 items-center font-semibold">
                      <Spin size="small" />
                      Emergency account is pending merge
                    </span>
                    <PendingMergeRetryCountdown
                      intervalSeconds={RETRY_INTERVAL_SECONDS}
                    />
                  </span>

                  <Button
                    type="default"
                    className="mb-auto"
                    icon={<IconRefresh />}
                    onClick={() => {
                      void refetchSetupStatus();
                    }}
                  >
                    Refresh Status
                  </Button>
                </div>
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

                  {pendingMergeCommand && (
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
          {!passwordReset && (
            <SkipForNow
              goNext={goNext}
              title="Keep the password your deployment minted. You can reset it later from the accounts page."
            />
          )}
          <Button
            type="text"
            className="text-light p-0 pl-2"
            onClick={goNext}
            disabled={!passwordReset}
          >
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
