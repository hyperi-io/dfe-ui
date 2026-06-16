import { FormNotification } from '@/core/components/FormNotification';
import { cn } from '@/core/utils/style';
import { IconPlayerPlay, IconRocket } from '@repo/dfe-icons';
import { Button } from 'antd';

export const BuildSourceBanner = ({
  onClick,
  isPending,
  error,
}: {
  onClick: () => void;
  isPending: boolean;
  error: Error | null;
}) => {
  return (
    <div
      className={cn(
        'border border-tertiary bg-tertiary/10 rounded-lg p-4',
        'flex gap-2 items-center',
      )}
    >
      <div className="w-full">
        <h4 className="text-base font-medium mb-2">Build Source</h4>

        <p>Build source to see DDL preview</p>

        {error && <FormNotification text={error.message} type="error" />}
      </div>
      <Button
        className="flex items-center gap-2"
        type="primary"
        loading={isPending}
        disabled={isPending}
        onClick={onClick}
      >
        Build <IconPlayerPlay />
      </Button>

      <Button
        className="flex items-center gap-2"
        type="primary"
        loading={isPending}
        disabled={isPending}
        onClick={onClick}
      >
        Deploy <IconRocket />
      </Button>
    </div>
  );
};
