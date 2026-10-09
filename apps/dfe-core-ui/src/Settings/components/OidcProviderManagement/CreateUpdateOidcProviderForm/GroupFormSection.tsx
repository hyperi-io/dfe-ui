import { CredentialField } from '@/core/components/CredentialField';
import { EnrichOnLoginField } from '@/core/components/EnrichOnLoginField';
import { Form } from '@/core/components/Form';
import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { GROUPS_FORM_NAME } from '@/core/constants/oidcProviders.constants';
import { groupModeOptionsForType } from '@/core/utils/oidcProviderPresets';
import { Input, InputNumber, Select } from 'antd';
import { useEffect, useRef } from 'react';
import { entraTenantFromIssuer, oktaDomainFromIssuer } from './issuer';

const OKTA_DOMAIN_NAME = [GROUPS_FORM_NAME, 'okta_domain'];
const TENANT_ID_NAME = [GROUPS_FORM_NAME, 'tenant_id'];

/** Keeps the field `name` set to what `derive` reads from the issuer, until the user types a different value. */
const useFieldFromIssuer = ({
  derive,
  enabled,
  name,
}: {
  derive: ({ issuer }: { issuer: string }) => string;
  enabled: boolean;
  name: string[];
}) => {
  const form = Form.useFormInstance();
  const issuer = Form.useWatch('issuer', form);
  const filled = useRef<string>(undefined);

  useEffect(() => {
    if (!enabled || typeof issuer !== 'string') {
      return;
    }
    const value = derive({ issuer });
    const current = form.getFieldValue(name);
    if (!current || current === filled.current) {
      form.setFieldValue(name, value);
    }
    filled.current = value;
  }, [derive, enabled, form, issuer, name]);
};

export const GroupFormSection = () => {
  const form = Form.useFormInstance();
  const type = Form.useWatch('type', form);
  const mode = Form.useWatch([GROUPS_FORM_NAME, 'mode'], form);
  const modeOptions = groupModeOptionsForType({ type });
  const isEntra = type === 'entra_id';
  const isGoogle = type === 'google';
  const isOkta = type === 'okta';

  useFieldFromIssuer({
    derive: oktaDomainFromIssuer,
    enabled: isOkta,
    name: OKTA_DOMAIN_NAME,
  });
  useFieldFromIssuer({
    derive: entraTenantFromIssuer,
    enabled: isEntra,
    name: TENANT_ID_NAME,
  });

  return (
    <SimpleCollapse
      title="Groups"
      classNames={{
        content: 'grid grid-cols-2 gap-2',
      }}
      defaultOpen={true}
    >
      <Form.Item label="Mode" name={[GROUPS_FORM_NAME, 'mode']}>
        <Select disabled={modeOptions.length === 1} options={modeOptions} />
      </Form.Item>

      <EnrichOnLoginField />

      {isOkta && mode === 'api' && (
        <>
          <Form.Item
            label="Okta Domain"
            name={OKTA_DOMAIN_NAME}
            tooltip="Filled in from the Issuer. Only change this if your Okta org uses a custom domain."
          >
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
      )}

      {isGoogle && (
        <>
          <Form.Item
            label="Admin Email"
            name={[GROUPS_FORM_NAME, 'admin_email']}
          >
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
      )}

      {isEntra && (mode === 'api' || mode === 'token_claim') && (
        <>
          <Form.Item name={TENANT_ID_NAME} hidden>
            <Input />
          </Form.Item>
          <CredentialField
            label="Directory Client Secret"
            valueName={[GROUPS_FORM_NAME, 'client_secret']}
            envName={[GROUPS_FORM_NAME, 'client_secret_env']}
            storedName={[GROUPS_FORM_NAME, 'client_secret_path']}
            secret
            tooltip="Leave blank to use the Client Secret above."
          />
        </>
      )}

      {mode === 'token_claim' && (
        <Form.Item
          label="Claim Name"
          name={[GROUPS_FORM_NAME, 'claim_name']}
          tooltip="Only change this if your login provider uses a name other than 'groups' for the user's groups."
        >
          <Input placeholder="groups" />
        </Form.Item>
      )}

      {mode === 'api' && (
        <Form.Item
          label="Sync Interval"
          name={[GROUPS_FORM_NAME, 'sync_interval']}
        >
          <InputNumber className="w-full" />
        </Form.Item>
      )}
    </SimpleCollapse>
  );
};
