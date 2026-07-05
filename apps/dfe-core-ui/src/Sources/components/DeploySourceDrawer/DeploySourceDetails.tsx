import { AceEditor } from '@/core/components/AceEditor';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { SourceDeployResponse } from '@/Sources/hooks/useDeploySource/types';
import { IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { Spin } from 'antd';

export const DeploySourceDetails = ({
  data,
  isPending,
  error,
}: {
  data: SourceDeployResponse | undefined;
  isPending: boolean;
  error: Error | null;
}) => {
  const noData = !data && !isPending && !error;

  const {
    source_name,
    success,
    deployed_version,
    deployed_at,
    ddl_executed,
    ddl_failed,
  } = data || {};

  return (
    <div className="flex flex-col gap-4">
      {isPending && (
        <>
          <Spin /> <span className="sr-only">Deploying source</span>
        </>
      )}
      {data && (
        <NotificationCard
          title={
            success ? (
              <span className="flex gap-2 items-center text-success">
                <IconCircleCheck className="w-4 h-4" /> Successfully deployed
                source
              </span>
            ) : (
              <span className="flex gap-2 items-center text-error">
                <IconCircleX className="w-4 h-4" /> Unable to deploy source
              </span>
            )
          }
          type={success ? 'success' : 'error'}
        />
      )}
      {data && (
        <div className="flex flex-col gap-2">
          <dl className="grid grid-cols-[155px_1fr] gap-x-2 gap-y-1 [&_dt]:font-medium">
            <dt>Source Name:</dt>
            <dd>{source_name}</dd>
            <dt>Deployed Version:</dt>
            <dd>{deployed_version}</dd>
            <dt>Deployed At:</dt>
            <dd>{deployed_at}</dd>
          </dl>
          {ddl_executed && ddl_executed.length > 0 ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">DDL Executed</span>}
              defaultOpen={true}
            >
              <AceEditor
                height="300px"
                name="ddl_executed"
                mode="sql"
                value={ddl_executed.join('\n\n')}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No DDL Executed" type="warning" />
          )}
          {ddl_failed && ddl_failed.length > 0 ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">DDL Failed</span>}
              defaultOpen={true}
            >
              <AceEditor
                mode="sql"
                height="300px"
                name="ddl_failed"
                value={ddl_failed.join('\n\n')}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard
              title={
                <span className="font-medium flex gap-2 items-center">
                  <IconCircleCheck className="w-4 h-4" /> No DDL Failed
                </span>
              }
            />
          )}
        </div>
      )}
      {error && (
        <NotificationCard
          title="Unable to deploy"
          description={error.message}
          type="error"
        />
      )}
      {noData && (
        <NotificationCard
          title="No data"
          description="No data to display"
          type="info"
        />
      )}
    </div>
  );
};
