'use client';

import { ArtifactDetailDrawer } from '@/Library/components/ArtifactDetailDrawer';
import { CreateArtifactDrawer } from '@/Library/components/CreateArtifactDrawer';
import { useFetchLibraryArtifacts } from '@/core/hooks/library/useFetchLibraryArtifacts';
import { useFetchLibraryKinds } from '@/Library/hooks/useFetchLibraryKinds';
import { MainContentCard } from '@/core/components/ContentCard';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { Button, Input, Select, Spin, Tag } from 'antd';
import { useState } from 'react';

const STATE_OPTIONS = [
  { label: 'enabled', value: 'enabled' },
  { label: 'disabled', value: 'disabled' },
  { label: 'deprecated', value: 'deprecated' },
];

/**
 * The artefact library: authored files that instances link to rather than copy.
 *
 * Filtering is on labels, group, kind and state - the classifying metadata.
 * Tags are not filters: they point at versions, and they show on the artefact
 * itself.
 */
export const LibraryScene = () => {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: kinds } = useFetchLibraryKinds();
  const { data, isLoading, error } = useFetchLibraryArtifacts({
    filters: {
      ...(search ? { q: search } : {}),
      ...(kind ? { kind } : {}),
      ...(state ? { state } : {}),
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => (
        <Button type="link" onClick={() => setSelected(value)}>
          {value}
        </Button>
      ),
    },
    { title: 'Kind', dataIndex: 'kind', key: 'kind' },
    { title: 'Group', dataIndex: 'group', key: 'group' },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      render: (value: number | null) => (value == null ? 'no versions' : value),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: Record<string, number>) => (
        <span className="flex flex-wrap gap-1">
          {Object.entries(tags ?? {}).map(([tag, version]) => (
            <Tag key={tag} color="blue">{`${tag} -> ${version}`}</Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Labels',
      dataIndex: 'labels',
      key: 'labels',
      render: (labels: Record<string, string>) => (
        <span className="flex flex-wrap gap-1">
          {Object.entries(labels ?? {}).map(([key, value]) => (
            <Tag key={key}>{`${key}=${value}`}</Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (value: string) => (
        <Tag color={value === 'enabled' ? 'green' : 'default'}>{value}</Tag>
      ),
    },
  ];

  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.library_read}>
        <RbacProtected.Unrestricted>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Input.Search
              allowClear
              className="max-w-64"
              placeholder="Search name or description"
              onSearch={setSearch}
            />
            <Select
              allowClear
              className="min-w-40"
              placeholder="Any kind"
              value={kind}
              onChange={setKind}
              options={(kinds ?? []).map((entry) => ({
                label: entry.name,
                value: entry.name,
              }))}
            />
            <Select
              allowClear
              className="min-w-40"
              placeholder="Any state"
              value={state}
              onChange={setState}
              options={STATE_OPTIONS}
            />
            <span className="ml-auto">
              <CreateArtifactDrawer />
            </span>
          </div>

          {isLoading && <Spin />}
          {error && (
            <NotificationCard
              type="error"
              title="Could not read the library"
              description={error.message}
            />
          )}
          {!isLoading && !error && (
            <Table rowKey="name" columns={columns} dataSource={data ?? []} />
          )}

          <ArtifactDetailDrawer
            artifact={selected}
            onClose={() => setSelected(null)}
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted className="h-full">
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
