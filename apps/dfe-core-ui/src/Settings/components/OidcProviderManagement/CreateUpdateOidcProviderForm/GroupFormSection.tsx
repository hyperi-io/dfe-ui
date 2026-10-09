import { CredentialField } from '@/core/components/CredentialField';
import { Form } from '@/core/components/Form';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import {
  GROUP_MODE_OPTIONS,
  GROUPS_FORM_NAME,
} from '@/core/constants/oidcProviders.constants';
import { Input, InputNumber, Select, Switch } from 'antd';

export const GroupFormSection = () => {
  return (
    <SimpleCollapse
      title="Groups"
      classNames={{
        content: 'grid grid-cols-2 gap-2',
      }}
      defaultOpen={true}
    >
      <Form.Item label="Mode" name={[GROUPS_FORM_NAME, 'mode']}>
        <Select options={GROUP_MODE_OPTIONS} />
      </Form.Item>

      <Form.Item
        label="Enrich on Login"
        name={[GROUPS_FORM_NAME, 'enrich_on_login']}
      >
        <Switch />
      </Form.Item>

      <>
        <Form.Item label="Okta Domain" name={[GROUPS_FORM_NAME, 'okta_domain']}>
          <Input />
        </Form.Item>
        <CredentialField
          label="API Token"
          valueName={[GROUPS_FORM_NAME, 'api_token']}
          envName={[GROUPS_FORM_NAME, 'api_token_env']}
          storedName={[GROUPS_FORM_NAME, 'api_token_path']}
          secret
        />
      </>

      <>
        <Form.Item label="Admin Email" name={[GROUPS_FORM_NAME, 'admin_email']}>
          <Input />
        </Form.Item>
        <Form.Item label="Domain" name={[GROUPS_FORM_NAME, 'domain']}>
          <Input />
        </Form.Item>
        <CredentialField
          label="Service Account JSON"
          valueName={[GROUPS_FORM_NAME, 'service_account_json']}
          envName={[GROUPS_FORM_NAME, 'service_account_json_env']}
          storedName={[GROUPS_FORM_NAME, 'service_account_json_path']}
          secret
        />
      </>

      <>
        <CredentialField
          label="Tenant ID"
          valueName={[GROUPS_FORM_NAME, 'tenant_id']}
          envName={[GROUPS_FORM_NAME, 'tenant_id_env']}
        />
        <CredentialField
          label="Directory Client Secret"
          valueName={[GROUPS_FORM_NAME, 'client_secret']}
          envName={[GROUPS_FORM_NAME, 'client_secret_env']}
          storedName={[GROUPS_FORM_NAME, 'client_secret_path']}
          secret
        />
      </>

      <>
        <Form.Item label="Claim Name" name={[GROUPS_FORM_NAME, 'claim_name']}>
          <Input />
        </Form.Item>
      </>

      <>
        <Form.Item
          label="Sync Interval"
          name={[GROUPS_FORM_NAME, 'sync_interval']}
        >
          <InputNumber className="w-full" />
        </Form.Item>
      </>
    </SimpleCollapse>
  );
};
