import { Form } from '@/core/components/Form';
import {
  ENTRA_API_SECRET_HINT,
  ENTRA_TOKEN_CLAIM_HINT,
  GOOGLE_SERVICE_ACCOUNT_HINT,
  GROUPS_FORM_NAME,
  groupModeOptions,
  MANUAL_MODE_HINT,
  SCOPES_PLACEHOLDER,
} from '@/core/constants/oidcProviders.constants';
import {
  defaultGroupMode,
  isDirectoryFieldUsed,
  isEnrichOnLoginSettable,
  isModeSettingUsed,
  isOidcProviderType,
  type TGroupMode,
} from '@/core/helpers/oidcProviderFieldRules';
import { FormRule, Input, InputNumber, Select, Switch } from 'antd';
import type { ReactNode } from 'react';

const groupsField = (field: string) => [GROUPS_FORM_NAME, field];

const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="col-span-2 m-0 text-sm text-foreground/50 dark:text-dark-foreground/50">
    {children}
  </p>
);

interface OidcLoginFieldsProps {
  rule: FormRule;
  disabledFields?: { name?: boolean; issuer?: boolean };
  hasStoredScopes?: boolean;
}

/** The login fields of an OIDC provider form, laid out for a two-column grid. */
export const OidcLoginFields = ({
  rule,
  disabledFields = {},
  hasStoredScopes = false,
}: OidcLoginFieldsProps) => (
  <>
    <Form.Item label="Name" name="name" rules={[rule]}>
      <Input disabled={disabledFields.name} />
    </Form.Item>
    <Form.Item label="Display Name" name="display_name" rules={[rule]}>
      <Input />
    </Form.Item>
    <Form.Item label="Issuer" name="issuer" rules={[rule]}>
      <Input disabled={disabledFields.issuer} />
    </Form.Item>
    <Form.Item label="Scopes" name="scopes" rules={[rule]}>
      <Select
        mode="tags"
        // An emptied edit keeps the stored scopes, so no default hint.
        placeholder={hasStoredScopes ? undefined : SCOPES_PLACEHOLDER}
        tokenSeparators={[' ', ',']}
        open={false}
        suffixIcon={null}
      />
    </Form.Item>
    <Form.Item
      label="Client ID"
      name="client_id"
      rules={[rule]}
      dependencies={['client_id_env']}
    >
      <Input />
    </Form.Item>
    <Form.Item label="Client ID Env Var" name="client_id_env" rules={[rule]}>
      <Input />
    </Form.Item>
    <Form.Item label="Client Secret" name="client_secret" rules={[rule]}>
      <Input.Password autoComplete="new-password" />
    </Form.Item>
    <Form.Item
      label="Client Secret Env Var"
      name="client_secret_env"
      rules={[rule]}
    >
      <Input />
    </Form.Item>
  </>
);

/**
 * The group fields of an OIDC provider form, laid out for a two-column grid.
 * Only the fields the engine uses for the chosen type and mode are shown.
 */
export const OidcGroupFields = ({ rule }: { rule: FormRule }) => {
  const form = Form.useFormInstance();
  // useWatch is undefined until after the first render, so read the store until then.
  const type: unknown = Form.useWatch('type') ?? form.getFieldValue('type');
  const watchedMode: TGroupMode | undefined =
    Form.useWatch(groupsField('mode')) ??
    form.getFieldValue(groupsField('mode'));

  if (!isOidcProviderType(type)) {
    return null;
  }
  const mode = watchedMode ?? defaultGroupMode(type);
  const uses = (field: Parameters<typeof isDirectoryFieldUsed>[0]) =>
    isDirectoryFieldUsed(field, type, mode);

  return (
    <>
      <Form.Item label="Mode" name={groupsField('mode')} rules={[rule]}>
        <Select options={groupModeOptions(type)} />
      </Form.Item>

      {mode === 'manual' && <FieldHint>{MANUAL_MODE_HINT}</FieldHint>}

      {isModeSettingUsed('claim_name', mode) && (
        <Form.Item
          label="Claim Name"
          name={groupsField('claim_name')}
          rules={[rule]}
        >
          <Input />
        </Form.Item>
      )}

      {isEnrichOnLoginSettable(type, mode) && (
        <Form.Item
          label="Enrich on Login"
          name={groupsField('enrich_on_login')}
          rules={[rule]}
        >
          <Switch />
        </Form.Item>
      )}

      {uses('okta_domain') && (
        <Form.Item
          label="Okta Domain"
          name={groupsField('okta_domain')}
          rules={[rule]}
          required
        >
          <Input />
        </Form.Item>
      )}

      {isModeSettingUsed('sync_interval', mode) && (
        <Form.Item
          label="Sync Interval"
          name={groupsField('sync_interval')}
          rules={[rule]}
        >
          <InputNumber className="w-full" min={60} suffix="seconds" />
        </Form.Item>
      )}

      {uses('tenant_id') && (
        <>
          {mode === 'token_claim' && (
            <FieldHint>{ENTRA_TOKEN_CLAIM_HINT}</FieldHint>
          )}
          <Form.Item
            label="Tenant ID"
            name={groupsField('tenant_id')}
            rules={[rule]}
            dependencies={[groupsField('tenant_id_env')]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tenant ID Env Var"
            name={groupsField('tenant_id_env')}
            rules={[rule]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      {uses('client_secret') && (
        <>
          {mode === 'api' && <FieldHint>{ENTRA_API_SECRET_HINT}</FieldHint>}
          <Form.Item
            label="Directory Secret"
            name={groupsField('client_secret')}
            rules={[rule]}
            dependencies={[
              groupsField('client_secret_env'),
              'client_secret',
              'client_secret_env',
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Directory Secret Env Var"
            name={groupsField('client_secret_env')}
            rules={[rule]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      {uses('api_token') && (
        <>
          <Form.Item
            label="API Token"
            name={groupsField('api_token')}
            rules={[rule]}
            dependencies={[groupsField('api_token_env')]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="API Token Env Var"
            name={groupsField('api_token_env')}
            rules={[rule]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      {uses('service_account_json') && (
        <>
          <FieldHint>{GOOGLE_SERVICE_ACCOUNT_HINT}</FieldHint>
          <Form.Item
            label="Service Account JSON"
            name={groupsField('service_account_json')}
            rules={[rule]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Service Account Env Var"
            name={groupsField('service_account_json_env')}
            rules={[rule]}
          >
            <Input />
          </Form.Item>
        </>
      )}

      {uses('domain') && (
        <Form.Item label="Domain" name={groupsField('domain')} rules={[rule]}>
          <Input />
        </Form.Item>
      )}
    </>
  );
};
