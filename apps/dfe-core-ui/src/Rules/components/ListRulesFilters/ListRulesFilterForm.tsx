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
  onClose?: () => void;
}

export const ListRulesFilterForm = ({
  onSuccess,
  onClose,
}: ListRulesFilterFormProps) => {
  const [form] = Form.useForm<FormData>();
  const { filters, setFilters } = useListRulesContext();
  const formValidation = useAntdZodResolver<FormData>(formSchema);

  const handleApplyFilters = (values: FormData) => {
    const { severity, search, source } = values;
    setFilters({
      severity: severity ?? undefined,
      search: search ?? undefined,
      source: source ?? undefined,
    });
    onSuccess?.();
  };

  const handleResetFilters = () => {
    form.setFieldsValue({ severity: undefined, search: '', source: undefined });
    setFilters({
      severity: undefined,
      search: undefined,
      source: undefined,
    });
    onClose?.();
  };

  useEffect(() => {
    form.setFieldsValue({
      severity: filters.severity ?? undefined,
      search: filters.search ?? '',
      source: filters.source,
    });
  }, [form, filters.severity, filters.search, filters.source]);

  const sortBySelectId = useId();

  return (
    <Form
      key={`${filters.search ?? ''}-${filters.severity ?? ''}-${filters.source ?? ''}`}
      form={form}
      onFinish={handleApplyFilters}
    >
      <SortActions
        id={{
          select: sortBySelectId,
        }}
        classNames={{ root: 'w-full', select: 'w-full' }}
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
        label="Keyword"
        rules={[formValidation]}
        layout="horizontal"
      >
        <Input
          size="small"
          placeholder="Filter keyword: name, hunt, or rule id"
        />
      </Form.Item>

      <Form.Item
        name="severity"
        label="Severity"
        rules={[formValidation]}
        layout="horizontal"
      >
        <Select
          allowClear
          size="small"
          placeholder="Filter severity"
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="source"
        label="Source"
        rules={[formValidation]}
        layout="horizontal"
      >
        <SourceSelect size="small" />
      </Form.Item>

      <Form.Item className="flex justify-end">
        <Button
          className="mr-2 mb-2 text-xs"
          type="text"
          htmlType="button"
          size="small"
          onClick={handleResetFilters}
          disabled={!filters.severity && !filters.search && !filters.source}
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
