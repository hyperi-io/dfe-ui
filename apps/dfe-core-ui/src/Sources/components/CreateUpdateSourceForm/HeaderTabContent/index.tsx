import { Form } from '@/core/components/Form';
import { FormRule, Input, Select } from 'antd';

export const HeaderTabContent = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => (
  <div className="flex gap-x-2">
    <Form.Item
      className="w-full"
      name={['header', 'type']}
      label="Header Type"
      rules={[formValidation]}
    >
      <Select
        options={[
          { label: 'Timeseries', value: 'time_series' },
          { label: 'Minimal', value: 'minimal' },
          { label: 'Passthrough', value: 'passthrough' },
        ]}
        placeholder="Select header type"
        allowClear
      />
    </Form.Item>
    <Form.Item
      className="w-full"
      name={['header', 'version']}
      label="Header Version"
      rules={[formValidation]}
    >
      <Input placeholder="Enter header version" />
    </Form.Item>
  </div>
);
