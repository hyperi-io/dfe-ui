import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useRetireAdmin } from '@/core/hooks/useRetireAdmin';
import { cn } from '@/core/utils/style';
import { IconArrowLeft, IconArrowRight, IconLockCheck } from '@repo/dfe-icons';
import { Alert, Button } from 'antd';
import { useRouter } from 'next/navigation';

export const CompleteStep = ({ goPrevious }: { goPrevious: () => void }) => {
  const router = useRouter();
  // Fetched here rather than passed in: the last step created the first user, so
  // the props this wizard was rendered with predate the answer.
  const { data: status } = useFetchSetupStatus();
  const { mutate: retire, isPending, error } = useRetireAdmin();

  const adminName = status?.admin_username || 'admin';

  return (
    <div className="text-white flex flex-col w-2/5">
      <h1 className="text-4xl font-light">Complete</h1>
      <p className={cn('text-lg font-extralight mr-auto')}>
        Congratulations! You have successfully configured the system.
      </p>

      {status?.retire_admin_available && (
        <div className="mt-8 flex flex-col gap-3">
          <p className="text-lg font-extralight">
            You now have an admin of your own, so the deployment no longer needs
            the <span className="font-normal">{adminName}</span> account it was
            given at install. Retire it and the engine stops recreating it on
            every start, which is what lets you delete the password your deploy
            minted -- the Secret key in Kubernetes, or the .env key with
            Compose. The break-glass account remains your way back in.
          </p>
          <Button
            className="mr-auto"
            loading={isPending}
            onClick={() => retire()}
          >
            <IconLockCheck /> Retire the bootstrap admin
          </Button>
          {error && (
            <Alert
              type="error"
              showIcon
              message="The engine would not retire the admin"
              description={error.message}
            />
          )}
        </div>
      )}

      {status?.admin_retired && (
        <Alert
          className="mt-8"
          type="success"
          showIcon
          message={`The ${adminName} account is retired`}
          description="It is disabled and is not recreated at the next start, so its minted password can be deleted from the secret store. Sign in as break-glass if you ever lose your own admin."
        />
      )}

      <div className="flex flex-row justify-between mt-10">
        <Button
          type="text"
          className="text-white text-light p-0"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <Button
          type="text"
          className="text-white text-light p-0"
          onClick={() => router.push('/')}
        >
          Get started <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};
