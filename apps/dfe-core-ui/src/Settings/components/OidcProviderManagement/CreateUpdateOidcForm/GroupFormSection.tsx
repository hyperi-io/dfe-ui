import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Form, Input, InputNumber, Select } from 'antd';

const GROUP_MODE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Token Claim', value: 'token_claim' },
  { label: 'API', value: 'api' },
];

const API_METHOD_OPTIONS = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
];

const API_RESPONSE_TYPE_OPTIONS = [
  { label: 'JSON', value: 'json' },
  { label: 'Text', value: 'text' },
  { label: 'Blob', value: 'blob' },
];

export const GroupFormSection = () => {
  return (
    <SimpleCollapse
      title="Groups"
      classNames={{
        content: 'grid grid-cols-2 gap-4',
      }}
    >
      <Form.Item label="Mode" name="mode">
        <Select options={GROUP_MODE_OPTIONS} />
      </Form.Item>
      <Form.Item label="Claim Name" name="claim_name">
        <Input />
      </Form.Item>
      <Form.Item label="Claim Value" name="claim_value">
        <Input />
      </Form.Item>
      <Form.Item label="API URL" name="api_url">
        <Input />
      </Form.Item>
      <Form.Item label="API Method" name="api_method">
        <Select options={API_METHOD_OPTIONS} />
      </Form.Item>
      <Form.Item label="API Headers" name="api_headers">
        <Input />
      </Form.Item>
      <Form.Item label="API Body" name="api_body">
        <Input />
      </Form.Item>
      <Form.Item label="API Response" name="api_response">
        <Input />
      </Form.Item>
      <Form.Item label="API Response Type" name="api_response_type">
        <Select options={API_RESPONSE_TYPE_OPTIONS} />
      </Form.Item>
      <Form.Item label="Service Account JSON" name="service_account_json">
        <Input.TextArea rows={10} />
      </Form.Item>
      <Form.Item label="Admin Email" name="admin_email">
        <Input />
      </Form.Item>
      <Form.Item label="Domain" name="domain">
        <Input />
      </Form.Item>
      <Form.Item label="Tenant ID Environment Variable" name="tenant_id_env">
        <Input />
      </Form.Item>
      <Form.Item
        label="Client Secret Environment Variable"
        name="client_secret_env"
      >
        <Input />
      </Form.Item>
      <Form.Item label="API Token Environment Variable" name="api_token_env">
        <Input />
      </Form.Item>
      <Form.Item label="Okta Domain" name="okta_domain">
        <Input />
      </Form.Item>
      <Form.Item label="Sync Interval" name="sync_interval">
        <InputNumber />
      </Form.Item>
    </SimpleCollapse>
  );
};
