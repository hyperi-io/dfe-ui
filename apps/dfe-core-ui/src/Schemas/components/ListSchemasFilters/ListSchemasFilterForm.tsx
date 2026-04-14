import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { Button, Input } from 'antd';
import { useEffect } from 'react';
import z from 'zod';

const formSchema = z.object({
  search: z.string().optional(),
  path_prefix: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListSchemasFilterFormProps {
  onSuccess?: () => void;
}

export const ListSchemasFilterForm = ({
  onSuccess,
}: ListSchemasFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListSchemasContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { search, path_prefix } = values;
    setFilters({
      search: search ?? undefined,
      path_prefix: path_prefix ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ path_prefix: undefined, search: '' });
    setFilters({
      search: undefined,
      path_prefix: undefined,
    });
  };
  useEffect(() => {
    form.setFieldsValue({
      search: filters.search ?? '',
      path_prefix: filters.path_prefix ?? undefined,
    });
  }, [form, filters.search, filters.path_prefix]);

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.path_prefix ?? ''}`}
      form={form}
      onFinish={handleApplyFilters}
    >
      <Form.Item
        name="search"
        label="Filter by Keyword"
        rules={[formValidation]}
      >
        <Input placeholder="Enter name or description" />
      </Form.Item>
      <Form.Item
        name="path_prefix"
        label="Filter by Path Prefix"
        rules={[formValidation]}
      >
        <Input placeholder="Enter path prefix" />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          size="small"
          htmlType="reset"
          onClick={handleResetFilters}
          disabled={!filters.search && !filters.path_prefix}
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
