import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { TGitOpsLogEntry } from '@/Platform/hooks/gitops/useFetchGitOpsLog/types';
import { Card } from 'antd';
import { Fragment, ReactNode } from 'react';

const NONE = 'None';

const termStyle = 'text-foreground/50 dark:text-dark-foreground/50';

const text = (value: string): ReactNode => value || NONE;

const list = (items: string[]): ReactNode =>
  items.length === 0 ? (
    NONE
  ) : (
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

type TRow = { label: string; value: ReactNode; wide?: boolean };

const rowsFor = (entry: TGitOpsLogEntry): TRow[] => [
  { label: 'Summary', value: text(entry.summary), wide: true },
  { label: 'Time', value: formatEpochSecondsLocal(entry.timestamp) },
  { label: 'Actor', value: text(entry.actor) },
  { label: 'Role', value: text(entry.role) },
  { label: 'Action', value: text(entry.action) },
  { label: 'Type', value: text(entry.ctype) },
  { label: 'Scope', value: text(entry.scope) },
  { label: 'State', value: text(entry.state) },
  { label: 'Commit', value: text(entry.sha) },
  { label: 'Request ID', value: text(entry.request_id) },
  { label: 'Conforming', value: entry.conforming ? 'Yes' : 'No' },
  { label: 'Files', value: list(entry.files), wide: true },
  { label: 'Resources', value: list(entry.resources), wide: true },
];

export const GitOpsLogsCard = ({ dataItem }: { dataItem: TGitOpsLogEntry }) => {
  return (
    <Card size="small">
      <dl className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 text-xs">
        {rowsFor(dataItem).map(({ label, value, wide }) => (
          <Fragment key={label}>
            <dt className={termStyle}>{label}</dt>
            <dd
              className={cn('m-0 min-w-0 break-all', wide && 'sm:col-span-3')}
            >
              {value}
            </dd>
          </Fragment>
        ))}
      </dl>
    </Card>
  );
};
