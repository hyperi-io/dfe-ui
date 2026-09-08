import { AceEditor } from '@/core/components/AceEditor';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { TSourceDeployResponse } from '@/Sources/hooks/useDeploySource/types';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconCircleCheck, IconCircleX } from '@repo/dfe-icons';
import { Spin } from 'antd';

export const DeployedSourceDetails = ({
  data,
  isPending,
  error,
}: {
  data:
    | TSourceDeployResponse
    | TSourceVersionDetail['version']['source_deployment']
    | undefined;
  isPending: boolean;
  error: Error | null;
}) => {
  const noData = !data && !isPending && !error;

  const {
    source_name,
    version,
    dry_run,
    applied,
    create_table,
    views,
    validation_errors,
    statements_applied,
    apps_synced,
    apps_sync_error,
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
            applied ? (
              <span className="flex gap-2 items-center text-success">
                <IconCircleCheck className="w-4 h-4" /> Successfully applied
                changes
              </span>
            ) : (
              <span className="flex gap-2 items-center text-error">
                <IconCircleX className="w-4 h-4" /> Unable to apply changes
              </span>
            )
          }
          type={applied ? 'success' : 'error'}
        />
      )}
      {data && (
        <div className="flex flex-col gap-2">
          <dl className="grid grid-cols-[155px_1fr] gap-x-2 gap-y-1 [&_dt]:font-medium">
            <dt>Source Name:</dt>
            <dd>{source_name}</dd>
            <dt>Version:</dt>
            <dd>{version}</dd>
            <dt>Dry Run:</dt>
            <dd>{dry_run ? 'Yes' : 'No'}</dd>
            <dt>Applied:</dt>
            <dd>{applied ? 'Yes' : 'No'}</dd>
            <dt>Statements Applied:</dt>
            <dd>{statements_applied}</dd>
            <dt>Apps Synced:</dt>
            <dd>{apps_synced?.length ? apps_synced.join(', ') : 'None'}</dd>
          </dl>
          {apps_sync_error && (
            <NotificationCard
              title="The apps did not follow this source"
              description={apps_sync_error}
              type="warning"
            />
          )}
          {create_table ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">DDL Executed</span>}
              defaultOpen={true}
            >
              <AceEditor
                height="300px"
                name="ddl_executed"
                mode="sql"
                value={create_table}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No DDL Executed" type="warning" />
          )}

          {views && Object.keys(views).length > 0 ? (
            <SimpleCollapse
              className="px-0"
              classNames={{
                content: 'flex flex-col gap-2',
              }}
              title={<span className="font-medium">Views Executed</span>}
              defaultOpen={true}
            >
              {Object.entries(views).map(([view_name, view_ddl]) => (
                <div className="flex flex-col gap-2" key={view_name}>
                  <span className="font-medium">{view_name}</span>
                  <AceEditor
                    key={view_name}
                    height="300px"
                    name="views_executed"
                    mode="sql"
                    value={view_ddl}
                  />
                </div>
              ))}
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No Views Executed" type="warning" />
          )}

          {validation_errors && validation_errors.length > 0 ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">Validation Errors</span>}
              defaultOpen={true}
            >
              <AceEditor
                height="300px"
                name="validation_errors"
                mode="sql"
                value={validation_errors.join('\n\n')}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No Validation Errors" type="warning" />
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
