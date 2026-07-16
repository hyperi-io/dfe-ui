import { Form } from '@/core/components/Form';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Input, InputNumber, Select } from 'antd';

const GROUP_MODE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Token Claim', value: 'token_claim' },
  { label: 'API', value: 'api' },
];

export const GroupFormSection = ({
  type,
  mode,
}: {
  type: string;
  mode: string;
}) => {
  return (
    <SimpleCollapse
      title="Groups"
      classNames={{
        content: 'grid grid-cols-2 gap-2',
      }}
      defaultOpen={true}
    >
      <Form.Item label="Mode" name="mode">
        <Select options={GROUP_MODE_OPTIONS} />
      </Form.Item>

      {type === 'okta' && (
        <>
          <Form.Item label="Okta Domain" name="okta_domain">
            <Input />
          </Form.Item>
          <Form.Item label="API Token" name="api_token_env">
            <Input />
          </Form.Item>
        </>
      )}

      {type === 'google' && (
        <>
          <Form.Item label="Admin Email" name="admin_email">
            <Input />
          </Form.Item>
          <Form.Item label="Domain" name="domain">
            <Input />
          </Form.Item>
          <Form.Item
            label="Service Account JSON"
            name="service_account_json_env"
          >
            <Input />
          </Form.Item>
        </>
      )}

      {type === 'entra_id' && (
        <>
          <Form.Item label="Tenant ID" name="tenant_id_env">
            <Input />
          </Form.Item>
          <Form.Item label="Client Secret" name="client_secret_env">
            <Input />
          </Form.Item>
        </>
      )}

      {mode === 'token_claim' && (
        <>
          <Form.Item label="Claim Name" name="claim_name">
            <Input />
          </Form.Item>
        </>
      )}
      {mode === 'api' && (
        <>
          <Form.Item label="Sync Interval" name="sync_interval">
            <InputNumber className="w-full" />
          </Form.Item>
        </>
      )}
    </SimpleCollapse>
  );
};
