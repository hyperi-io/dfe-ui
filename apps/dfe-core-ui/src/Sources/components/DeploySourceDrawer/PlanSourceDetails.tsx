import { AceEditor } from '@/core/components/AceEditor';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { SourcePlanResponse } from '@/Sources/hooks/usePlanSource/types';
import { IconCircleCheck, IconCircleX, IconRocket } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';

export const PlanSourceDetails = ({
  data,
  isPending,
  error,
  source_name,
  version,
  onDeploy,
}: {
  data: SourcePlanResponse | undefined;
  isPending: boolean;
  error: Error | null;
  source_name: string;
  version: string;
  onDeploy: (data: { name: string; version: string }) => void;
}) => {
  const noData = !data && !isPending && !error;

  const handleDeploySource = () => {
    onDeploy?.({ name: source_name, version });
  };

  const {
    source_name: planned_source_name,
    version: planned_version,
    planned_at,
    table_exists,
    ddl,
    validation_errors,
    statements,
    ready,
  } = data || {};

  return (
    <>
      {isPending && (
        <>
          <Spin /> <span className="sr-only">Planning source</span>
        </>
      )}
      {data && (
        <div className="flex flex-col gap-4">
          <NotificationCard
            title="Review Plan"
            description="Review the planned schema before deploying."
            action={
              <Button
                className="flex items-center gap-2"
                type="primary"
                onClick={() => handleDeploySource()}
              >
                Deploy <IconRocket />
              </Button>
            }
            type="action"
          />
          <dl className="grid grid-cols-[120px_1fr_120px_1fr] gap-x-2 gap-y-1 [&_dt]:font-medium [&_dd]:items-center [&_dd]:flex [&_dd]:gap-2">
            <dt>Source Name:</dt>
            <dd>{planned_source_name}</dd>
            <dt>Version:</dt>
            <dd>{planned_version}</dd>
            <dt>Planned At:</dt>
            <dd>{planned_at}</dd>
            <dt>Table Exists:</dt>
            <dd>{table_exists ? 'Yes' : 'No'}</dd>
            <dt>Ready:</dt>
            <dd>
              {ready ? (
                <>
                  <IconCircleCheck className="w-4 h-4 text-success" />
                  Ready
                </>
              ) : (
                <>
                  <IconCircleX className="w-4 h-4 text-error" />
                  Not Ready
                </>
              )}
            </dd>
          </dl>
          {ddl && ddl.create_table ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">Generated DDL</span>}
              defaultOpen={true}
            >
              <AceEditor
                height="300px"
                name="create_table"
                mode="sql"
                value={ddl.create_table}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No DDL generated" type="warning" />
          )}
          {statements && statements.length > 0 ? (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">Statements</span>}
              defaultOpen={true}
            >
              <AceEditor
                height="300px"
                mode="sql"
                value={statements?.join('\n\n')}
              />
            </SimpleCollapse>
          ) : (
            <NotificationCard title="No Statements" />
          )}
          {validation_errors && validation_errors.length > 0 && (
            <SimpleCollapse
              className="px-0"
              title={<span className="font-medium">Validation Errors</span>}
              defaultOpen={true}
            >
              {validation_errors.map((error) => (
                <NotificationCard key={error} title={error} type="error" />
              ))}
            </SimpleCollapse>
          )}
        </div>
      )}
      {error && (
        <NotificationCard
          title="An error occurred"
          description={error.message}
          type="error"
        />
      )}
      {noData && (
        <NotificationCard
          title="Unexpected error"
          description="Unable to plan source"
          type="warning"
        />
      )}
    </>
  );
};
