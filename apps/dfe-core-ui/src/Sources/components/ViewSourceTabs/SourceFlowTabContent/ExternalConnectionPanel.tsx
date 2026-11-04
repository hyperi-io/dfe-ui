'use client';

import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { cn } from '@/core/utils/style';
import type { TSourceVersionDetail } from '@/core/config/api/sources.types';

export type TExternalConnection = NonNullable<
  TSourceVersionDetail['connection']
>;

type THeaderField = TExternalConnection['header_fields'][number];

const NONE = 'none';

/** The facts a pipeline is configured with, in the order its config asks for them. */
const connectionFacts = (connection: TExternalConnection) => [
  { label: 'Bootstrap', value: connection.bootstrap, code: true },
  {
    label: 'Security',
    value: connection.sasl_mechanism
      ? `${connection.security_protocol}, ${connection.sasl_mechanism}`
      : connection.security_protocol,
    code: true,
  },
  ...(connection.reads
    ? [{ label: 'Reads', value: connection.reads, code: true }]
    : []),
  { label: 'Writes', value: connection.writes, code: true },
  ...(connection.consumer_group
    ? [
        {
          label: 'Consumer group',
          value: connection.consumer_group,
          code: true,
        },
      ]
    : []),
  {
    label: 'Credential',
    value: connection.credential_ref ?? 'not set',
    code: !!connection.credential_ref,
  },
  { label: 'Organisation', value: connection.org ?? 'default' },
  {
    label: 'Other tenant ids kept',
    value: connection.allowed_org_ids.join(', ') || NONE,
    code: connection.allowed_org_ids.length > 0,
  },
  {
    label: 'Other sources kept',
    value: connection.allowed_sources.join(', ') || NONE,
    code: connection.allowed_sources.length > 0,
  },
];

// The explanations wrap inside their columns, so the table fits the card at every width.
const HEADER_COLUMNS = [
  {
    title: 'Field',
    dataIndex: 'field',
    key: 'field',
    width: 180,
    render: (field: string) => <code>{field}</code>,
  },
  { title: 'Left out', dataIndex: 'when_missing', key: 'when_missing' },
  { title: 'Set by your pipeline', dataIndex: 'when_set', key: 'when_set' },
];

/**
 * What the customer's own pipeline is told to connect with, read off the engine.
 *
 * Every value comes from the source's connection block, so the console never
 * rebuilds a topic or group name from the naming convention.
 */
export const ExternalConnectionPanel = ({
  connection,
}: {
  connection: TExternalConnection;
}) => (
  <SectionCard
    title={
      <h2 className="text-foreground-muted dark:text-dark-foreground-muted text-base font-semibold">
        Connect your pipeline
      </h2>
    }
    description={
      connection.role === 'origin'
        ? 'Your pipeline is this source. Point its Kafka output at the topic below.'
        : "Your pipeline is this source's transform. It reads and writes the topics below."
    }
  >
    <dl
      data-testid="external-connection"
      className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm"
    >
      {connectionFacts(connection).map((fact) => (
        <div key={fact.label} className="contents">
          <dt className="text-foreground/50 dark:text-dark-foreground/50">
            {fact.label}
          </dt>
          <dd className={cn('m-0 wrap-break-word', fact.code && 'font-mono')}>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>

    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold">
        Header fields, and what each one buys
      </h3>
      <Table<THeaderField>
        rowKey="field"
        columns={HEADER_COLUMNS}
        dataSource={connection.header_fields}
        scroll={undefined}
        tableLayout="fixed"
      />
    </div>

    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-sm font-semibold">A record that sets them all</h3>
      <CopyCodeBlock code={JSON.stringify(connection.sample_record, null, 2)} />
    </div>
  </SectionCard>
);
