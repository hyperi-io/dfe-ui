import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { useListSchemasContext } from '@/core/contexts/ListSchemasContext';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { Button, Input } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListSchemasFilterFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export const ListSchemasFilterForm = ({
  onSuccess,
  onClose,
}: ListSchemasFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListSchemasContext();
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
        id={{
          select: sortBySelectId,
        }}
        sortByValue={filters.sort_by}
        sortDirectionValue={filters.sort_order}
        sortByOptions={[
          { label: 'Path', value: 'path' },
          { label: 'Description', value: 'description' },
        ]}
        onChange={({ sortBy, sortDirection }) =>
          setFilters({
            ...(sortBy !== undefined && {
              sort_by: sortBy as 'path' | 'description',
            }),
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
        <Input size="small" placeholder="Filter keyword: name or description" />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          size="small"
          htmlType="reset"
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
