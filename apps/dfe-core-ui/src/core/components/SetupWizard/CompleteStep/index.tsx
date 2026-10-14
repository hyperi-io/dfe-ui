import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { cn } from '@/core/utils/style';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Alert, Button } from 'antd';
import { useRouter } from 'next/navigation';

// No goPrevious once setup is complete: every step behind this one is closed.
export const CompleteStep = ({ goPrevious }: { goPrevious?: () => void }) => {
  const router = useRouter();
  // Fetched here rather than passed in: the last step created the first user, so
  // the props this wizard was rendered with predate the answer.
  const { data: status } = useFetchSetupStatus();

  const adminName = status?.admin_username || 'admin';

  return (
    <div className="text-white flex flex-col w-2/5">
      <h1 className="text-4xl font-light">Complete</h1>
      <p className={cn('text-lg font-extralight mr-auto')}>
        Congratulations! You have successfully configured the system.
      </p>

      {status && !status.admin_retired && (
        <p className="mt-8 text-lg font-extralight">
          The <span className="font-normal">{adminName}</span> account stays as
          your local way in. Reset its password any time under Settings, Account
          Management, Security accounts.
        </p>
      )}

      {status?.admin_retired && (
        <Alert
          className="mt-8"
          type="success"
          showIcon
          title={`The ${adminName} account is retired`}
          description="It is disabled and is not recreated at the next start, so its minted password can be deleted from the secret store. Sign in as break-glass if you ever lose your own admin."
        />
      )}

      <div className="flex flex-row justify-between mt-10">
        {goPrevious && (
          <Button
            type="text"
            className="text-white text-light p-0"
            onClick={goPrevious}
          >
            <IconArrowLeft /> Back
          </Button>
        )}

        <Button
          type="text"
          className="text-white text-light p-0 ml-auto"
          onClick={() => router.push('/')}
        >
          Get started <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};
