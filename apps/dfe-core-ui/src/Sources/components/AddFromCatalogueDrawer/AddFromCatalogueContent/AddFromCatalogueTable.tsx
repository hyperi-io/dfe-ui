import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchSourceCatalogue } from '@/Sources/hooks/useFetchSourceCatalogue';
import {
  TCatalogueEntry,
  TCatalogueIntake,
} from '@/Sources/hooks/useFetchSourceCatalogue/types';
import { Button, Input, Select, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

export const AddFromCatalogueTable = ({
  onSelect,
}: {
  onSelect: (entry: TCatalogueEntry) => void;
}) => {
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<TCatalogueIntake>();

  const { componentHeight } = useSetComponentHeight({
    offset: 220,
  });

  const { entries, total, isLoading } = useFetchSourceCatalogue({
    search,
    intake: intakeFilter,
  });

  const columns: ColumnsType<TCatalogueEntry> = [
    {
      title: 'Entry',
      dataIndex: 'name',
      key: 'name',
      width: '50%',
      render: (name) => (
        <Highlighter searchWords={[search]} textToHighlight={name} />
      ),
    },
    {
      title: 'Dataset',
      dataIndex: 'dataset',
      key: 'dataset',
      width: '50%',
    },
    {
      title: 'Arrives by',
      dataIndex: 'intakes',
      key: 'intakes',
      width: '220px',
      render: (intakes: string[]) => (
        <div className="flex gap-2">
          {intakes.map((intake) => (
            <Tag key={intake}>
              <Highlighter
                searchWords={
                  intakeFilter
                    ? [
                        INTAKE_OPTIONS_MAP[
                          intakeFilter as keyof typeof INTAKE_OPTIONS_MAP
                        ] ?? intake,
                      ]
                    : []
                }
                textToHighlight={
                  INTAKE_OPTIONS_MAP[
                    intake as keyof typeof INTAKE_OPTIONS_MAP
                  ] ?? intake
                }
              />
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '',
      key: 'select',
      width: '75px',
      render: (_: unknown, entry: TCatalogueEntry) => (
        <Button size="small" type="primary" onClick={() => onSelect(entry)}>
          Select
        </Button>
      ),
    },
  ];

  return (
    <Table<TCatalogueEntry>
      loading={isLoading}
      scroll={{ y: componentHeight, x: 'max-content' }}
      locale={{
        emptyText: !isLoading && (
          <NotificationCard
            type="default"
            title="No catalogue is mounted on this deployment, or nothing matches the filter."
          />
        ),
      }}
      title={() => (
        <div className="flex justify-between items-center">
          <span className="font-medium">{total} entries found</span>
          <div className="flex items-center gap-2">
            <Input.Search
              placeholder="Search by name or dataset"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              className="w-96"
              placeholder="Select intake"
              allowClear
              value={intakeFilter}
              onChange={(value) => setIntakeFilter(value)}
              options={INTAKE_OPTIONS}
            />
          </div>
        </div>
      )}
      rowKey="name"
      columns={columns}
      dataSource={entries}
    />
  );
};
