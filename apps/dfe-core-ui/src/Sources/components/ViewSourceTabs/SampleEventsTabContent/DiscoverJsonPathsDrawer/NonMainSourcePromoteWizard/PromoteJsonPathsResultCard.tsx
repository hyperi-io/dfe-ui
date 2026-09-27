import { NotificationCard } from '@/core/components/NotificationCard';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { IconCheck, IconExclamationMark } from '@repo/dfe-icons';

export const PromoteJsonPathsResultCard = ({
  result: { json_path, status, column_name, error },
}: {
  result: TPromoteFieldResponse['results'][number];
}) => {
  return (
    <SimpleCollapse
      title={
        <span className="font-semibold flex items-center gap-x-2">
          <Tooltip title={<>Status: {status}</>} destroyOnHidden>
            <span
              role="img"
              aria-label={`Status: ${status}`}
              className={cn(
                'inline-flex text-white',
                'p-0.5 rounded-full',
                status === 'ok' ? 'bg-success' : 'bg-error',
              )}
            >
              {status === 'ok' ? <IconCheck /> : <IconExclamationMark />}
            </span>
          </Tooltip>
          <span className="flex items-center gap-x-2">
            {json_path}
            {column_name && (
              <span className="bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1 text-xs">
                {column_name}
              </span>
            )}
          </span>
        </span>
      }
      defaultOpen={false}
      className="border border-foreground/10 dark:border-dark-foreground/10 rounded-md p-2"
    >
      <div className="flex flex-col gap-y-4">
        {error && (
          <NotificationCard
            title={`${json_path} has the following errors`}
            description={error}
            type="error"
          />
        )}
      </div>
    </SimpleCollapse>
  );
};
