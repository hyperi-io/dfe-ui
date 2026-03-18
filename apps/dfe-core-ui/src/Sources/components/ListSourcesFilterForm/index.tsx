import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Input, Select } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { useListSourcesContext } from '../../contexts/ListSourcesContext';

const formSchema = z.object({
  search: z.string().optional(),
  enabled: z.enum(['true', 'false']).optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ListSourcesFilterForm = () => {
  const [form] = Form.useForm<FormData>();
  const {
    data: { items: sources, total },
    filters,
    setFilters,
  } = useListSourcesContext();
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
        <Input placeholder="Enter name or description" />
      </Form.Item>
      <Form.Item
        name="enabled"
        label="Filter by Status"
        rules={[formValidation]}
      >
        <Select
          placeholder="Select status"
          options={[
            { label: 'Enabled', value: 'true' },
            { label: 'Disabled', value: 'false' },
          ]}
          allowClear
        />
      </Form.Item>

      <div className="flex justify-between items-center my-2 flex-wrap gap-y-2">
        <p className="text-md text-gray-400">
          {sources.length} of {total}{' '}
          {sources.length > 1 ? 'results' : 'result'}
        </p>

        <SortActions
          sortByValue={filters.sort_by}
          sortDirectionValue={filters.sort_order}
          sortByOptions={[
            { label: 'Source', value: 'source' },
            { label: 'Display Name', value: 'display_name' },
            { label: 'Enabled', value: 'enabled' },
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
