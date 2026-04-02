import { Form } from '@/core/components/Form';
import { Input } from 'antd';

export const CreateOrganisationForm = () => {
  return (
    <Form>
      <Form.Item
        name="name"
        label="Name"
        rules={[
          {
            required: true,
            message: 'Please enter the name of the organisation',
          },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
};
