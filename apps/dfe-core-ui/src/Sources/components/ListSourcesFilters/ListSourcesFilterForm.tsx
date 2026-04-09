import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Button, Input, Select } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
  enabled: z.enum(['true', 'false']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListSourcesFilterFormProps {
  onSuccess?: () => void;
}

export const ListSourcesFilterForm = ({
  onSuccess,
}: ListSourcesFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListSourcesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { search, enabled } = values;
    setFilters({
      search: search ?? undefined,
      enabled: enabled ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ enabled: undefined, search: '' });
    setFilters({
      search: undefined,
      enabled: undefined,
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
      enabled: filters.enabled ?? undefined,
    });
  }, [form, filters.search, filters.enabled]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.enabled ?? ''}`}
      form={form}
      onFinish={handleApplyFilters}
    >
      <SortActions
        id={{
          select: sortBySelectId,
        }}
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
            ...(sortDirection !== undefined && {
              sort_order: sortDirection,
            }),
          })
        }
      />

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

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          size="small"
          htmlType="reset"
          onClick={handleResetFilters}
          disabled={!filters.search && !filters.enabled}
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
