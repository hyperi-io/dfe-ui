import { AddSchemaTable } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/core/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import { InvalidColumnsTable } from '@/core/components/CreateSchemaForm/InvalidColumnsTable';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { Input } from 'antd';
import { useMemo, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

export const UploadedSchemaTable = ({ title }: { title?: string }) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const {
    formValidation,
    invalidUploadedSchemaColumns,
    uploadedSchemaColumns,
    handleRemoveUploadedSchemaColumn,
  } = useCreateSchemaFormContext();

  const hasInvalidColumns = invalidUploadedSchemaColumns.length > 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 620,
  });

  const filteredColumns = useMemo(
    () =>
      uploadedSchemaColumns.filter((column) =>
        column.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
      ),
    [uploadedSchemaColumns, debouncedSearch],
  );

  return (
    <div className="flex flex-col gap-y-4">
      {hasInvalidColumns && <InvalidColumnsTable />}

      <div className="flex flex-col gap-y-2">
        {hasInvalidColumns && (
          <label htmlFor="uploadedColumns">Uploaded Columns</label>
        )}
        <AddSchemaTable
          name="uploadedColumns"
          initialValues={filteredColumns}
          formValidation={formValidation}
          title={() => (
            <div className="flex items-center justify-between w-full">
              {title && <span className="font-medium">{title}</span>}
              <Input.Search
                className="ml-auto w-96"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>
          )}
          config={{
            defaultEditFields: false,
            defaultAddColumns: false,
            defaultRemoveColumns: true,
          }}
          scroll={{
            y: componentHeight,
            x: 'max-content',
          }}
          pagination={{
            defaultPageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: [10, 25, 50, 100],
          }}
          onRemoveRow={(row) =>
            handleRemoveUploadedSchemaColumn(
              typeof row?.id === 'string' ? row.id : undefined,
            )
          }
        />
      </div>
    </div>
  );
};
