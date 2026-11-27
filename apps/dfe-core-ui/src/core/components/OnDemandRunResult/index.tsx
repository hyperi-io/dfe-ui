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

// The matched line leads, ahead of the timestamps and ids every row carries.
const LEAD_COLUMNS = ['_raw', '_json'];

const leadFirst = (columns: string[]) => {
  const lead = LEAD_COLUMNS.find((column) => columns.includes(column));
  return lead
    ? [lead, ...columns.filter((column) => column !== lead)]
    : columns;
};

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
  const columnNames = leadFirst(
    data.columns && data.columns.length > 0
      ? data.columns
      : rows[0]
        ? Object.keys(rows[0])
        : [],
  );
  const keyedRows = rows.map((row, index) => ({ key: index, row }));
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
            rowKey="key"
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            dataSource={keyedRows}
            columns={columnNames.map((column) => ({
              title: column,
              dataIndex: ['row', column],
              ellipsis: true,
              render: (value: unknown) => cellText(value),
            }))}
          />
        ) : sqlErrors.length === 0 ? (
          <p className="text-xs text-foreground-muted dark:text-dark-foreground-muted">
            No rows matched in this window.
          </p>
        ) : null}
      </section>
    </div>
  );
};
