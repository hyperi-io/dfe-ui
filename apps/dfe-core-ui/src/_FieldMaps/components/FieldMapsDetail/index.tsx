import { AceEditor } from '@/core/components/AceEditor';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Table } from '@/core/components/Table';
import { useListFieldMapsContext } from '@/core/contexts/ListFieldMapsContext';
import { useFetchFieldMapDetail } from '@/core/hooks/useFetchFieldMapDetail';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { Spin } from 'antd';
import { type ReactNode } from 'react';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const sectionTitleStyle =
  'font-medium text-foreground/60 dark:text-dark-foreground/60';

const EmptyData = ({ children = 'None' }: { children?: ReactNode }) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {children}
  </span>
);

interface MappingRow {
  standardField: string;
  sourceField: string;
}

const MAPPING_COLUMNS = [
  { title: 'Standard field', dataIndex: 'standardField', key: 'standardField' },
  { title: 'Source field', dataIndex: 'sourceField', key: 'sourceField' },
];

export const FieldMapsDetail = () => {
  const { selectedFieldMap } = useListFieldMapsContext();
  const {
    data: fieldMapDetailData,
    isLoading: isFetchingFieldMapDetail,
    error: fetchFieldMapDetailError,
  } = useFetchFieldMapDetail({
    standard: selectedFieldMap?.map_standard ?? null,
    source: selectedFieldMap?.map_source ?? null,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 125,
  });

  if (isFetchingFieldMapDetail)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  if (fetchFieldMapDetailError)
    return (
      <GenericErrorCard
        title="Error fetching field map detail"
        description={fetchFieldMapDetailError.message}
      />
    );

  if (!fieldMapDetailData) {
    return (
      <EmptyDetail
        title="No field map selected"
        description="Please add or select a field map to see the detail."
      />
    );
  }

  const { standard, source, version, inherits, description, mappings } =
    fieldMapDetailData;
  const mappingRows: MappingRow[] = Object.entries(mappings ?? {}).map(
    ([standardField, sourceField]) => ({ standardField, sourceField }),
  );

  return (
    <CustomScrollbar height={componentHeight}>
      <dl className="grid grid-cols-[155px_1fr] gap-x-6 gap-y-1 mb-4">
        <dt className={dataListTermStyle}>Standard:</dt>
        <dd>{standard}</dd>

        <dt className={dataListTermStyle}>Source:</dt>
        <dd>{source || <EmptyData>Default map for the standard</EmptyData>}</dd>

        <dt className={dataListTermStyle}>Version:</dt>
        <dd>{version || <EmptyData />}</dd>

        <dt className={dataListTermStyle}>Inherits:</dt>
        <dd>{inherits || <EmptyData />}</dd>

        <dt className={dataListTermStyle}>Description:</dt>
        <dd>{description || <EmptyData />}</dd>
      </dl>

      <SimpleCollapse
        classNames={{ container: 'px-0', title: sectionTitleStyle }}
        title="Mappings"
        defaultOpen
      >
        {/* No vertical scroll: a fixed header splits the grid into two tables and the cells lose their column names. */}
        <Table<MappingRow>
          columns={MAPPING_COLUMNS}
          dataSource={mappingRows}
          rowKey="standardField"
          scroll={{ x: 'max-content' }}
        />
      </SimpleCollapse>

      <SimpleCollapse
        classNames={{ container: 'px-0', title: sectionTitleStyle }}
        title="JSON"
      >
        <AceEditor
          name="field_map_detail_json"
          value={JSON.stringify(fieldMapDetailData, null, 2)}
          mode="json"
          height="400px"
          readOnly
        />
      </SimpleCollapse>
    </CustomScrollbar>
  );
};
