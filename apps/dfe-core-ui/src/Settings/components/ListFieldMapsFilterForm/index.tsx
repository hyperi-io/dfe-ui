import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import { Input } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { useListFieldMapsContext } from '../../contexts/ListFieldMapsContext';

const formSchema = z.object({
  standard: z.string().optional(),
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ListFieldMapsFilterForm = () => {
  const [form] = Form.useForm<FormData>();
  const {
    data: { items: fieldMaps, total },
    filters,
    setFilters,
  } = useListFieldMapsContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  useEffect(() => {
    form.setFieldsValue(filters);
  }, [filters, form]);

  return (
    <Form
      form={form}
      onValuesChange={(_changedValues, allValues) => {
        setFilters({ ...filters, ...allValues });
      }}
    >
      <Form.Item
        name="search"
        label="Filter by Keyword"
        rules={[formValidation]}
      >
        <Input placeholder="Enter keyword" />
      </Form.Item>

      <Form.Item
        name="standard"
        label="Filter by Standard"
        rules={[formValidation]}
      >
        <Input placeholder="Enter standard name" />
      </Form.Item>

      <div className="flex justify-between items-center my-2 flex-wrap gap-y-2">
        <p className="text-md text-gray-400">
          {fieldMaps.length} of {total}{' '}
          {fieldMaps.length > 1 ? 'results' : 'result'}
        </p>

        <SortActions
          sortByValue={filters.sort_by}
          sortDirectionValue={filters.sort_order}
          sortByOptions={[
            { label: 'Standard', value: 'standard' },
            { label: 'Source', value: 'source' },
            { label: 'Mapping Count', value: 'mapping_count' },
          ]}
          onChange={({ sortBy, sortDirection }) =>
            setFilters({
              ...(sortBy !== undefined && { sort_by: sortBy }),
              ...(sortDirection !== undefined && { sort_order: sortDirection }),
            })
          }
        />
      </div>
    </Form>
  );
};
