import { Form } from '@/core/components/Form';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolved';
import { Input, Select } from 'antd';
import { useEffect } from 'react';
import z from 'zod';
import { useListSourcesContext } from './context';

const formSchema = z.object({
  search: z.string().optional(),
  enabled: z.enum(['true', 'false']).optional(),
});

type FormData = z.infer<typeof formSchema>;

export const ListSourcesFilter = () => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListSourcesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  useEffect(() => {
    form.setFieldsValue(filters);
  }, [filters, form]);

  return (
    <Form
      form={form}
      onValuesChange={(_changedValues, allValues) => {
        setFilters(allValues);
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
    </Form>
  );
};
