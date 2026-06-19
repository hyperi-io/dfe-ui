import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useListServicesContext } from '@/core/contexts/ListServicesContext';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  service: z.string().optional(),
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListServicesFilterFormProps {
  onSuccess?: () => void;
}

export const ListServicesFilterForm = ({
  onSuccess,
}: ListServicesFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListServicesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { service, search } = values;
    setFilters({
      service: service ?? undefined,
      search: search ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ service: '', search: '' });
    setFilters({
      service: undefined,
      search: undefined,
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      service: filters.service ?? '',
      search: filters.search ?? '',
    });
  }, [form, filters.service, filters.search]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.service ?? ''}`}
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
          { label: 'Service', value: 'service' },
          { label: 'Instance', value: 'instance' },
          { label: 'Updated At', value: 'updated_at' },
        ]}
        onChange={({ sortBy, sortDirection }) =>
          setFilters({
            ...(sortBy !== undefined && { sort_by: sortBy }),
            ...(sortDirection !== undefined && { sort_order: sortDirection }),
          })
        }
      />

      <Form.Item
        name="search"
        label="Filter by Keyword"
        rules={[formValidation]}
      >
        <Input placeholder="Enter keyword" />
      </Form.Item>

      <Form.Item
        name="service"
        label="Filter by Service"
        rules={[formValidation]}
      >
        <Input placeholder="Enter service name" />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.service && !filters.search}
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
