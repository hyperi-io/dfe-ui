import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { useListFieldMapsContext } from '../../contexts/ListFieldMapsContext';

const formSchema = z.object({
  standard: z.string().optional(),
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListFieldMapsFilterFormProps {
  onSuccess?: () => void;
}

export const ListFieldMapsFilterForm = ({
  onSuccess,
}: ListFieldMapsFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListFieldMapsContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { standard, search } = values;
    setFilters({
      standard: standard ?? undefined,
      search: search ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ standard: '', search: '' });
    setFilters({
      standard: undefined,
      search: undefined,
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
      standard: filters.standard ?? '',
    });
  }, [form, filters.search, filters.standard]);

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.standard ?? ''}`}
      form={form}
      onFinish={handleApplyFilters}
    >
      <div className="flex justify-between items-center flex-wrap gap-y-2">
        <label htmlFor="sort-by">Sort by</label>

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

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.standard && !filters.search}
        >
          Reset Filters
        </Button>
        <Button type="default" htmlType="submit">
          Apply Filters
        </Button>
      </Form.Item>
    </Form>
  );
};
