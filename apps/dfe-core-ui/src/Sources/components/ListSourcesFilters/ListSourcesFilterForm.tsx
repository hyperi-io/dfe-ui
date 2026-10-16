import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { Button, Input, Select } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['enabled', 'disabled']).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListSourcesFilterFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const transformFiltersEnabledFormDataToRequest = (
  status: string | undefined,
) => {
  if (status === 'enabled') return 'enabled';
  if (status === 'disabled') return 'disabled';
  return undefined;
};

const transformFiltersEnabledRequestToFormData = (
  status: 'enabled' | 'disabled' | undefined,
) => {
  if (status === 'enabled') return 'enabled';
  if (status === 'disabled') return 'disabled';
  return undefined;
};
export const ListSourcesFilterForm = ({
  onSuccess,
  onClose,
}: ListSourcesFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListSourcesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { search, status } = values;
    setFilters({
      search: search ?? undefined,
      status: transformFiltersEnabledFormDataToRequest(status),
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ status: undefined, search: '' });
    setFilters({
      search: undefined,
      status: undefined,
    });
    onClose?.();
  };

  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
      status: transformFiltersEnabledRequestToFormData(filters.status),
    });
  }, [form, filters.search, filters.status]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.status ?? ''}`}
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
        label="Keyword"
        rules={[formValidation]}
        layout="horizontal"
      >
        <Input
          allowClear
          size="small"
          placeholder="Filter keyword: name or description"
        />
      </Form.Item>
      <Form.Item
        name="status"
        label="Status"
        rules={[formValidation]}
        layout="horizontal"
      >
        <Select
          size="small"
          placeholder="Filter status"
          options={[
            { label: 'Enabled', value: 'enabled' },
            { label: 'Disabled', value: 'disabled' },
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
          disabled={!filters.search && !filters.status}
        >
          Reset Filters
        </Button>
        <Button size="small" type="default" htmlType="submit">
          Apply Filters
        </Button>
      </Form.Item>
    </Form>
  );
};
