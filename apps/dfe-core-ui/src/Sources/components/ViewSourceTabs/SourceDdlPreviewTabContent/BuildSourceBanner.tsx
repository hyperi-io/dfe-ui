import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { DeploySourceDrawer } from '@/Sources/components/DeploySourceDrawer';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { Button } from 'antd';

export const BuildSourceBanner = ({
  onClick,
  isPending,
  error,
  source_name,
  version,
}: {
  onClick: () => void;
  isPending: boolean;
  error: Error | null;
  source_name: string;
  version: string;
}) => {
  return (
    <NotificationCard
      title="Build Source"
      type="action"
      description={
        <div className="flex flex-col gap-1">
          <p>Build source to see DDL preview</p>

          {error && <FormNotification text={error.message} type="error" />}
        </div>
      }
      action={
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2"
            type="primary"
            loading={isPending}
            disabled={isPending}
            onClick={onClick}
          >
            Build <IconPlayerPlay />
          </Button>

          <DeploySourceDrawer source_name={source_name} version={version} />
        </div>
      }
    />
  );
};
