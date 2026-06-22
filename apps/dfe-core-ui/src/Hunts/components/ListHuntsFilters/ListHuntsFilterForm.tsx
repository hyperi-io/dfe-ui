import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { HuntSortBy } from '@/Hunts/hooks/useFetchInfiniteFilteredHunts/types';
import { Button, Input } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListHuntsFilterFormProps {
  onSuccess?: () => void;
}

export const ListHuntsFilterForm = ({
  onSuccess,
}: ListHuntsFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListHuntsContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { search } = values;
    setFilters({
      search: search ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ search: '' });
    setFilters({
      search: undefined,
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
    });
  }, [form, filters.search]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}`}
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
          { label: 'Hunt ID', value: 'hunt_id' },
          { label: 'Hunt Name', value: 'hunt_name' },
          { label: 'Source Table', value: 'source_table' },
          { label: 'Target Table', value: 'target_table' },
        ]}
        onChange={({ sortBy, sortDirection }) =>
          setFilters({
            ...(sortBy !== undefined && { sort_by: sortBy as HuntSortBy }),
            ...(sortDirection !== undefined && {
              sort_order: sortDirection as 'asc' | 'desc',
            }),
          })
        }
      />

      <Form.Item
        name="search"
        label="Filter by Keyword"
        rules={[formValidation]}
      >
        <Input placeholder="Name, Customers, Rules, etc." />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mb-2 mr-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.search}
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
