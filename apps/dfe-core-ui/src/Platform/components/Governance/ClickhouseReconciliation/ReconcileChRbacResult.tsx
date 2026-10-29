import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import type { TReconcileGovernanceChRbacResponse } from '@/Platform/hooks/governance/useReconcileGovernanceChRbac/types';
import { Tag, Typography } from 'antd';
import type { ReactNode } from 'react';
import z from 'zod';

// The engine's spec types this body as an open object, so it is checked here.
const reconcileResultSchema = z.object({
  statements: z.number().int().nonnegative(),
  dropped: z.number().int().nonnegative(),
  minted: z.array(z.string()),
  errors: z.array(z.string()),
  projection_missing: z.array(z.string()),
});

type TReconcileResult = z.infer<typeof reconcileResultSchema>;

interface TReconcileRow {
  id: string;
  action: string;
  result: ReactNode;
}

const NameTags = ({ names }: { names: string[] }) => (
  <span className="flex flex-wrap gap-1">
    {names.map((name) => (
      <Tag key={name} className="m-0">
        {name}
      </Tag>
    ))}
  </span>
);

const countLabel = (count: number, verb: string) =>
  count === 0 ? 'None' : `${count} ${verb}`;

const toRows = (result: TReconcileResult): TReconcileRow[] => [
  {
    id: 'statements',
    action: 'Apply quota tiers, service roles and row policies',
    result: countLabel(result.statements, 'statements run'),
  },
  {
    id: 'dropped',
    action: 'Drop objects no longer configured',
    result: countLabel(result.dropped, 'dropped'),
  },
  {
    id: 'minted',
    action: 'Write service-user secrets',
    result:
      result.minted.length === 0 ? 'None' : <NameTags names={result.minted} />,
  },
  {
    id: 'projection',
    action: 'Write the governance projection tables',
    result:
      result.projection_missing.length === 0 ? (
        'Written'
      ) : (
        <span className="flex flex-col gap-1">
          <span>Skipped, these tables are not on the server:</span>
          <NameTags names={result.projection_missing} />
        </span>
      ),
  },
  ...result.errors.map((error, index) => ({
    id: `error-${index}`,
    action: 'Error',
    result: <Typography.Text type="danger">{error}</Typography.Text>,
  })),
];

const COLUMNS = [
  { title: 'Action', dataIndex: 'action', key: 'action', width: '45%' },
  { title: 'Result', dataIndex: 'result', key: 'result' },
];

export const ReconcileChRbacResult = ({
  data,
}: {
  data: TReconcileGovernanceChRbacResponse;
}) => {
  const parsed = reconcileResultSchema.safeParse(data);

  if (!parsed.success) {
    return (
      <div className="flex flex-col gap-3">
        <NotificationCard
          type="warning"
          title="Reconcile finished"
          description="The engine answered in a form this console does not lay out, so the full answer is shown as sent."
        />
        <CopyCodeBlock code={JSON.stringify(data, null, 2)} />
      </div>
    );
  }

  const result = parsed.data;
  const errorCount = result.errors.length;

  return (
    <div className="flex flex-col gap-3">
      {errorCount === 0 ? (
        <NotificationCard
          type="success"
          title="Reconcile finished with no errors"
        />
      ) : (
        <NotificationCard
          type="error"
          title={`Reconcile finished with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`}
          description="The table shows what ran. Fix the errors and run it again."
        />
      )}
      <Table<TReconcileRow>
        columns={COLUMNS}
        dataSource={toRows(result)}
        // Fixed layout with no scroll box keeps both columns inside the drawer.
        tableLayout="fixed"
        scroll={undefined}
      />
    </div>
  );
};
