import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { HuntSortBy } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { Button, Input } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListHuntsFilterFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ListHuntsFilterForm = ({
  onSuccess,
  onClose,
}: ListHuntsFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters, hasFilters } = useListHuntsContext();
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
    onClose?.();
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
        showLabel={!hasFilters}
        id={{
          select: sortBySelectId,
        }}
        classNames={{ root: 'w-full', select: 'w-full' }}
        sortByValue={filters.sort_by}
        sortDirectionValue={filters.sort_order}
        sortByOptions={[
          { label: 'Name', value: 'name' },
          { label: 'Display Name', value: 'display_name' },
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
        <Input size="small" placeholder="Name, Customers, Rules, etc." />
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
          Clear Filters
        </Button>
        <Button size="small" type="default" htmlType="submit">
          Apply Filters
        </Button>
      </Form.Item>
    </Form>
  );
};
