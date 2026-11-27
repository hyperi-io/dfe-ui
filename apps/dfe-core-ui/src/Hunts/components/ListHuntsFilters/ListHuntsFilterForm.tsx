import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { HuntSortBy } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { RuleSelect } from '@/Hunts/components/RuleSelectCreate';
import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import { Button, Input } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional().nullable(),
  rule: z.string().optional().nullable(),
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
  const { filters, setFilters } = useListHuntsContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { search, rule } = values;
    setFilters({
      search: search ?? null,
      rule: rule ?? null,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ search: '', rule: null });
    setFilters({
      search: null,
      rule: null,
    });
    onClose?.();
  };

  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
      rule: filters.rule ?? null,
    });
  }, [form, filters.search, filters.rule]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}:${filters.rule ?? ''}`}
      form={form}
      onFinish={handleApplyFilters}
      initialValues={{
        rule: filters.rule ?? null,
        search: filters.search ?? '',
      }}
    >
      <SortActions
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
        label="Keyword"
        rules={[formValidation]}
        layout="horizontal"
      >
        <Input
          size="small"
          placeholder="Filter keyword: name, customers or rules"
        />
      </Form.Item>

      <Form.Item
        name="rule"
        label="Rule"
        rules={[formValidation]}
        layout="horizontal"
      >
        <RuleSelect
          size="small"
          showCreate={false}
          allowClear
          mode={undefined}
        />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mb-2 mr-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.search && !filters.rule}
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
