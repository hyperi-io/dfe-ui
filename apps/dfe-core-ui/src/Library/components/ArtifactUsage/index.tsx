'use client';

import { useFetchLibraryUsage } from '@/Library/hooks/useFetchLibraryUsage';
import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { Spin, Tag } from 'antd';

const COLUMNS = [
  { title: 'App', dataIndex: 'service', key: 'service' },
  { title: 'Instance', dataIndex: 'instance', key: 'instance' },
  { title: 'File set', dataIndex: 'file_set', key: 'file_set' },
  {
    title: 'File',
    dataIndex: 'name',
    key: 'name',
    render: (value: string) => (
      <span className="font-mono text-xs">{value}</span>
    ),
  },
  {
    title: 'Linked to',
    key: 'linked',
    render: (_: unknown, row: { version: number; tag?: string }) =>
      row.tag ? (
        <Tag color="blue">{`${row.tag} (version ${row.version})`}</Tag>
      ) : (
        <Tag>{`version ${row.version}`}</Tag>
      ),
  },
];

/**
 * Which instances link to this artefact.
 *
 * This is what a delete is refused against, and what tells you the blast of a
 * new version before you publish one.
 */
export const ArtifactUsage = ({ artifact }: { artifact: string }) => {
  const { data, isLoading, error } = useFetchLibraryUsage({ artifact });

  if (isLoading) return <Spin size="small" />;

  if (error) {
    return (
      <NotificationCard
        type="error"
        title="Could not read usage"
        description={error.message}
      />
    );
  }

  return (
    <Table
      rowKey={(row) =>
        `${row.service}/${row.instance}/${row.file_set}/${row.name}`
      }
      columns={COLUMNS}
      dataSource={data ?? []}
    />
  );
};
