'use client';

import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useCreateSourceFromCatalogue } from '@/Sources/hooks/useCreateSourceFromCatalogue';
import { useFetchSourceCatalogue } from '@/Sources/hooks/useFetchSourceCatalogue';
import {
  TCatalogueEntry,
  TCatalogueIntake,
} from '@/Sources/hooks/useFetchSourceCatalogue/types';
import { IconPlus } from '@repo/dfe-icons';
import { Alert, Button, Input, Select, Tag, notification } from 'antd';
import { useState } from 'react';

const TITLE = 'Add from catalogue';

// Every entry ships this one; the extras are per entry.
const DEFAULT_TRANSFORM = 'default';

const INTAKE_OPTIONS: { value: TCatalogueIntake; label: string }[] = [
  { value: 'beats', label: 'Beats' },
  { value: 'receiver', label: 'Pushed to the receiver' },
  { value: 'fetcher', label: 'Pulled by a fetcher' },
];

const intakeLabel = (intake: string) =>
  INTAKE_OPTIONS.find((option) => option.value === intake)?.label ?? intake;

export const AddFromCatalogueDrawer = () => {
  const [api, contextHolder] = notification.useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<TCatalogueIntake>();
  const [selected, setSelected] = useState<TCatalogueEntry>();
  const [intake, setIntake] = useState<TCatalogueIntake>();
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);
  const [name, setName] = useState('');

  const { entries, total, isLoading } = useFetchSourceCatalogue({
    search,
    intake: intakeFilter,
  });

  const { setSelectedSource } = useListSourcesContext();
  const { mutate, isPending, error, reset } = useCreateSourceFromCatalogue({
    onSuccess: (response) => {
      setSelectedSource({
        source_name: response.source,
        source_version: response.current,
      });
      setIsOpen(false);
      api.success({
        title: `Source ${response.source} created from the catalogue`,
        placement: 'bottomLeft',
      });
      // The source is saved either way; only the deploy-repo follow-up failed.
      if (response.apps_sync_error) {
        api.warning({
          title: 'The apps did not follow this source',
          description: response.apps_sync_error,
          placement: 'bottomLeft',
        });
      }
    },
  });

  const select = (entry: TCatalogueEntry) => {
    reset();
    setSelected(entry);
    setIntake(entry.intakes[0] as TCatalogueIntake);
    setTransform(entry.transforms[0] ?? DEFAULT_TRANSFORM);
    setName(entry.source);
  };

  const columns = [
    { title: 'Entry', dataIndex: 'name', key: 'name' },
    { title: 'Dataset', dataIndex: 'dataset', key: 'dataset' },
    {
      title: 'Arrives by',
      dataIndex: 'intakes',
      key: 'intakes',
      render: (intakes: string[]) =>
        intakes.map((value) => <Tag key={value}>{intakeLabel(value)}</Tag>),
    },
    {
      title: '',
      key: 'select',
      render: (_: unknown, entry: TCatalogueEntry) => (
        <Button
          size="small"
          type={selected?.name === entry.name ? 'primary' : 'default'}
          onClick={() => select(entry)}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <RbacProtected action={RbacProtected.rbacActions.source_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            className="border border-tertiary text-tertiary"
            icon={<IconPlus className="text-tertiary" />}
            onClick={() => setIsOpen(true)}
          >
            {TITLE}
          </Button>
        </RbacProtected.Unrestricted>
      </RbacProtected>

      <Drawer
        title={TITLE}
        open={isOpen}
        size="60%"
        onClose={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              aria-label="Search the catalogue"
              placeholder="Search the catalogue"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select
              aria-label="Filter by intake"
              className="min-w-56"
              allowClear
              placeholder="Any intake"
              options={INTAKE_OPTIONS}
              value={intakeFilter}
              onChange={setIntakeFilter}
            />
          </div>

          <Table<TCatalogueEntry>
            rowKey="name"
            loading={isLoading}
            columns={columns}
            dataSource={entries}
          />

          {total === 0 && !isLoading && (
            <Alert
              type="info"
              title="No catalogue is mounted on this deployment, or nothing matches the filter."
            />
          )}

          {selected && (
            <div className="flex flex-col gap-2">
              <Select<TCatalogueIntake>
                aria-label="Intake for this source"
                options={INTAKE_OPTIONS.filter((option) =>
                  selected.intakes.includes(option.value),
                )}
                value={intake}
                onChange={setIntake}
              />
              {selected.transforms.length > 1 && (
                <Select
                  aria-label="Transform for this source"
                  options={selected.transforms.map((value) => ({
                    value,
                    label: value,
                  }))}
                  value={transform}
                  onChange={setTransform}
                />
              )}
              <Input
                aria-label="Source name"
                placeholder="Source name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {error && <Alert type="error" message={error.message} />}
              <Button
                type="primary"
                loading={isPending}
                disabled={!intake || !name}
                onClick={() =>
                  intake &&
                  mutate({
                    entry: selected.name,
                    body: { intake, name, transform, archive: false },
                  })
                }
              >
                Add {selected.name}
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};
