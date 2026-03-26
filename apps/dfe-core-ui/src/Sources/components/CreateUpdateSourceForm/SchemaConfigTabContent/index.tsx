import { Form } from '@/core/components/Form';
import { FormRule, Input, InputNumber, Select } from 'antd';

export const SchemaConfigTabContent = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => (
  <div className="grid grid-cols-3 gap-2">
    <Form.Item
      className="w-full"
      name={['schema', 'meta_schema']}
      label="Meta Schema"
      rules={[formValidation]}
    >
      <Input placeholder="Enter meta schema" />
    </Form.Item>
    <Form.Item
      className="w-full"
      name={['schema', 'meta_schema_version']}
      label="Meta Schema Version"
      rules={[formValidation]}
    >
      <Input placeholder="Enter meta schema version" />
    </Form.Item>
    <Form.Item
      className="w-full"
      name={['schema', 'derived_schema']}
      label="Derived Schema"
      rules={[formValidation]}
    >
      <Input placeholder="Enter derived schema" />
    </Form.Item>
    <Form.Item
      className="w-full"
      name={['schema', 'additional_fields']}
      label="Additional Fields"
      rules={[formValidation]}
    >
      <Input placeholder="Enter additional fields" />
    </Form.Item>

    <Form.Item
      className="w-full"
      name={['schema', 'engine']}
      label="Engine"
      rules={[formValidation]}
    >
      <Select
        placeholder="Enter engine"
        options={[
          { label: 'MergeTree', value: 'MergeTree' },
          { label: 'ReplicatedMergeTree', value: 'ReplicatedMergeTree' },
          { label: 'SharedMergeTree', value: 'SharedMergeTree' },
        ]}
      />
    </Form.Item>
    <Form.Item
      className="w-full"
      name={['schema', 'ttl_days']}
      label="TTL Days"
      rules={[formValidation]}
    >
      <InputNumber placeholder="Enter TTL days" />
    </Form.Item>
  </div>
);
