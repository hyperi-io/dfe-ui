import { NotificationCard } from '@/core/components/NotificationCard';
import { RuleCostEstimate } from '@/core/components/RuleSaveNotice';
import { Table } from '@/core/components/Table';
import {
  DfeClientOperationFor,
  DfeClientSuccessResponseBody,
} from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { IconAlertCircle } from '@repo/dfe-icons';
import { ReactNode } from 'react';

export type OnDemandRunResponse = DfeClientSuccessResponseBody<
  DfeClientOperationFor<typeof API_CONFIG.rulesV2.run, 'post'>
>;

const count = new Intl.NumberFormat('en-AU');

const cellText = (value: unknown) => {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const OnDemandRunResult = ({
  data,
  errorAction,
}: {
  data: OnDemandRunResponse;
  errorAction?: ReactNode;
}) => {
  const rows = data.results ?? [];
  const columnNames =
    data.columns && data.columns.length > 0
      ? data.columns
      : rows[0]
        ? Object.keys(rows[0])
        : [];
  const sqlErrors = data.sql_errors ?? [];
  const warnings = data.cost_estimate.warnings ?? [];

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs [&_dt]:font-medium">
        <dt>Source</dt>
        <dd>{data.source}</dd>
        <dt>Database</dt>
        <dd>{data.source_db}</dd>
        <dt>Table</dt>
        <dd>{data.source_table}</dd>
        <dt>Window</dt>
        <dd>{count.format(data.cost_window_minutes)} minutes</dd>
        <dt>Query time</dt>
        <dd>{count.format(data.execution_time_ms)} ms</dd>
      </dl>

      {data.truncated && (
        <NotificationCard
          type="warning"
          title="Results were capped"
          description="More rows matched than were returned. The list stops at the detections-per-run cap."
        />
      )}

      {sqlErrors.length > 0 && (
        <NotificationCard
          type="error"
          title={
            <span className="flex items-center gap-x-2 text-error">
              <IconAlertCircle /> SQL errors
            </span>
          }
          description={
            <ul className="list-disc list-inside text-xs">
              {sqlErrors.map((sqlError) => (
                <li key={`${sqlError.message}-${sqlError.position ?? ''}`}>
                  {sqlError.message}
                  {sqlError.suggestion ? ` ${sqlError.suggestion}` : ''}
                </li>
              ))}
            </ul>
          }
          action={errorAction}
        />
      )}

      <section
        aria-label="Alert volume preview"
        className="flex flex-col gap-2"
      >
        <h3 className="text-sm font-medium">Alert volume preview</h3>
        <div className="text-xs">
          <RuleCostEstimate estimate={data.cost_estimate} />
        </div>
        {warnings.length > 0 && (
          <ul className="list-disc pl-4 text-xs">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Matching rows" className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          Matching rows
          {rows.length > 0 ? ` (${count.format(rows.length)})` : ''}
        </h3>
        {columnNames.length > 0 ? (
          <Table
            rowKey={(_row, index) => String(index)}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            dataSource={rows}
            columns={columnNames.map((column) => ({
              title: column,
              dataIndex: [column],
              ellipsis: true,
              render: (value: unknown) => cellText(value),
            }))}
          />
        ) : (
          <p className="text-xs text-foreground-muted dark:text-dark-foreground-muted">
            No rows matched in this window.
          </p>
        )}
      </section>
    </div>
  );
};
