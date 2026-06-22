import { Form } from '@/core/components/Form';
import { SortActions } from '@/core/components/SortActions';
import { SourceSelect } from '@/core/components/SourceSelect';
import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import { useListRulesContext } from '@/Rules/contexts/ListRulesContext';
import { Button, Input, Select } from 'antd';
import { useEffect, useId } from 'react';
import z from 'zod';

const formSchema = z.object({
  severity: z.string().optional(),
  search: z.string().optional(),
  source: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ListRulesFilterFormProps {
  onSuccess?: () => void;
}

export const ListRulesFilterForm = ({
  onSuccess,
}: ListRulesFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListRulesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { severity, search } = values;
    setFilters({
      severity: severity ?? undefined,
      search: search ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ severity: undefined, search: '' });
    setFilters({
      severity: undefined,
      search: undefined,
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      severity: filters.severity ?? undefined,
      search: filters.search ?? '',
    });
  }, [form, filters.severity, filters.search]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.severity ?? ''}`}
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
          { label: 'Hunt Name', value: 'hunt_name' },
          { label: 'Name', value: 'name' },
          { label: 'Severity', value: 'severity' },
          { label: 'Source', value: 'source' },
          { label: 'Created At', value: 'created_at' },
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
        <Input placeholder="Name, hunt, or rule id" />
      </Form.Item>

      <Form.Item name="severity" label="Severity" rules={[formValidation]}>
        <Select
          allowClear
          placeholder="Any severity"
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]}
        />
      </Form.Item>

      <Form.Item name="source" label="Source" rules={[formValidation]}>
        <SourceSelect />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.severity && !filters.search}
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
