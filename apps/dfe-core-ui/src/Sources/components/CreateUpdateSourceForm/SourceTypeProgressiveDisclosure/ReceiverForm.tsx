import { Form } from '@/core/components/Form';
import { FormRule, Input } from 'antd';

export const ReceiverForm = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  return (
    <>
      <Form.Item
        name={['match', 'field']}
        label="Field"
        rules={[formValidation]}
      >
        <Input placeholder="Enter field" />
      </Form.Item>
      <Form.Item
        name={['match', 'value']}
        label="Value"
        rules={[formValidation]}
      >
        <Input placeholder="Enter value" />
      </Form.Item>
    </>
  );
};
