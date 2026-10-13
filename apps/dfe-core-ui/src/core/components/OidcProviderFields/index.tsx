import { CredentialField } from '@/core/components/CredentialField';
import { Form } from '@/core/components/Form';
import {
  IssuerField,
  type TIssuerBuilder,
  useIssuerBuilder,
} from '@/core/components/IssuerField';
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
  entraTenantFromIssuer,
  oktaDomainFromIssuer,
} from '@/core/helpers/oidcIssuer';
import {
  defaultGroupMode,
  isDirectoryFieldUsed,
  isEnrichOnLoginForced,
  isEnrichOnLoginSettable,
  isModeSettingUsed,
  isOidcProviderType,
  type TGroupMode,
} from '@/core/helpers/oidcProviderFieldRules';
import { presetFieldsForType } from '@/core/utils/oidcProviderPresets';
import {
  type FormInstance,
  FormRule,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'antd';
import { type ReactNode, useEffect, useRef } from 'react';

const groupsField = (field: string) => [GROUPS_FORM_NAME, field];

const ENRICH_ON_LOGIN_NAME = groupsField('enrich_on_login');
const OKTA_DOMAIN_NAME = groupsField('okta_domain');
const TENANT_ID_NAME = groupsField('tenant_id');
const TENANT_ID_ENV_NAME = groupsField('tenant_id_env');

const FieldHint = ({ children }: { children: ReactNode }) => (
  <p className="col-span-2 m-0 text-sm text-foreground/50 dark:text-dark-foreground/50">
    {children}
  </p>
);

/** Keeps the field `name` set to what `derive` reads from the issuer, until it holds a value this did not fill or the field `unlessSet` holds one. */
const useFieldFromIssuer = ({
  derive,
  enabled,
  name,
  unlessSet,
}: {
  derive: ({ issuer }: { issuer: string }) => string;
  enabled: boolean;
  name: string[];
  unlessSet?: string[];
}) => {
  const form = Form.useFormInstance();
  const issuer: unknown = Form.useWatch('issuer', form);
  const filled = useRef<string>(undefined);

  useEffect(() => {
    if (!enabled || typeof issuer !== 'string') {
      return;
    }
    const value = derive({ issuer });
    const current: unknown = form.getFieldValue(name);
    const isSetElsewhere =
      unlessSet !== undefined && !!form.getFieldValue(unlessSet);
    if (!isSetElsewhere && (!current || current === filled.current)) {
      form.setFieldValue(name, value);
    }
    filled.current = value;
  }, [derive, enabled, form, issuer, name, unlessSet]);
};

/** The Type change both provider forms make: presets fill what the user has not typed, and the guided issuer follows the new type. */
export const useOidcProviderTypeChange = ({ form }: { form: FormInstance }) => {
  const issuerBuilder = useIssuerBuilder({ form });

  const changeType = (type: string) => {
    form.setFieldsValue(
      presetFieldsForType({ current: form.getFieldsValue(true), type }),
    );
    issuerBuilder.changeType(type);
  };

  return { changeType, issuerBuilder };
};

interface OidcLoginFieldsProps {
  rule: FormRule;
  issuerBuilder: TIssuerBuilder;
  disabledFields?: { name?: boolean; issuer?: boolean };
  hasStoredScopes?: boolean;
}

/** The login fields of an OIDC provider form, laid out for a two-column grid. */
export const OidcLoginFields = ({
  rule,
  issuerBuilder,
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
    <IssuerField
      builder={issuerBuilder}
      disabled={disabledFields.issuer}
      rule={rule}
    />
    <CredentialField
      label="Client ID"
      valueName="client_id"
      envName="client_id_env"
      rule={rule}
    />
    <CredentialField
      label="Client Secret"
      valueName="client_secret"
      envName="client_secret_env"
      storedName="client_secret_path"
      rule={rule}
      secret
    />
    <Form.Item
      className="col-span-2"
      label="Scopes"
      name="scopes"
      rules={[rule]}
    >
      <Select
        mode="tags"
        // An emptied edit keeps the stored scopes, so no default hint.
        placeholder={hasStoredScopes ? undefined : SCOPES_PLACEHOLDER}
        tokenSeparators={[' ', ',']}
        open={false}
        suffixIcon={null}
      />
    </Form.Item>
  </>
);

interface OidcGroupFieldsProps {
  rule: FormRule;
  /** Fills the Okta Domain from the issuer, for a new provider only: an edit keeps what is stored. */
  derivesFromIssuer?: boolean;
}

/**
 * The group fields of an OIDC provider form, laid out for a two-column grid.
 * Only the fields the engine uses for the chosen type and mode are shown.
 */
export const OidcGroupFields = ({
  rule,
  derivesFromIssuer = false,
}: OidcGroupFieldsProps) => {
  const form = Form.useFormInstance();
  // useWatch is undefined until after the first render, so read the store until then.
  const type: unknown = Form.useWatch('type') ?? form.getFieldValue('type');
  const watchedMode: TGroupMode | undefined =
    Form.useWatch(groupsField('mode')) ??
    form.getFieldValue(groupsField('mode'));
  const providerType = isOidcProviderType(type) ? type : undefined;
  const mode =
    watchedMode ?? (providerType ? defaultGroupMode(providerType) : undefined);
  const isEnrichLocked =
    providerType !== undefined &&
    mode !== undefined &&
    !isEnrichOnLoginSettable(providerType, mode);
  const enrichForced =
    providerType !== undefined && isEnrichOnLoginForced(providerType);

  useFieldFromIssuer({
    derive: oktaDomainFromIssuer,
    enabled: derivesFromIssuer && providerType === 'okta',
    name: OKTA_DOMAIN_NAME,
  });
  // A provider that stores no tenant, new or edited, takes the one its issuer names; a stored one is left alone.
  useFieldFromIssuer({
    derive: entraTenantFromIssuer,
    enabled: providerType === 'entra_id',
    name: TENANT_ID_NAME,
    unlessSet: TENANT_ID_ENV_NAME,
  });

  // The engine stores its own value when the type and mode leave no choice, so the switch shows that value.
  useEffect(() => {
    if (isEnrichLocked) {
      form.setFieldValue(ENRICH_ON_LOGIN_NAME, enrichForced);
    }
  }, [enrichForced, form, isEnrichLocked]);

  if (!providerType || !mode) {
    return null;
  }
  const uses = (field: Parameters<typeof isDirectoryFieldUsed>[0]) =>
    isDirectoryFieldUsed(field, providerType, mode);
  const modeOptions = groupModeOptions(providerType);

  return (
    <>
      <Form.Item label="Mode" name={groupsField('mode')} rules={[rule]}>
        <Select disabled={modeOptions.length === 1} options={modeOptions} />
      </Form.Item>

      <Form.Item
        label="Enrich on Login"
        name={ENRICH_ON_LOGIN_NAME}
        rules={[rule]}
      >
        <Switch disabled={isEnrichLocked} />
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

      {uses('okta_domain') && (
        <Form.Item
          label="Okta Domain"
          name={OKTA_DOMAIN_NAME}
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
          {/* Read from the issuer, never typed; errors show on the Issuer row. */}
          <Form.Item name={TENANT_ID_NAME} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={TENANT_ID_ENV_NAME} hidden>
            <Input />
          </Form.Item>
        </>
      )}

      {uses('client_secret') && (
        <>
          {mode === 'api' && <FieldHint>{ENTRA_API_SECRET_HINT}</FieldHint>}
          <CredentialField
            label="Directory Secret"
            valueName={groupsField('client_secret')}
            envName={groupsField('client_secret_env')}
            storedName={groupsField('client_secret_path')}
            rule={rule}
            dependencies={['client_secret', 'client_secret_env']}
            secret
          />
        </>
      )}

      {uses('api_token') && (
        <CredentialField
          label="API Token"
          valueName={groupsField('api_token')}
          envName={groupsField('api_token_env')}
          storedName={groupsField('api_token_path')}
          rule={rule}
          secret
        />
      )}

      {uses('service_account_json') && (
        <>
          <FieldHint>{GOOGLE_SERVICE_ACCOUNT_HINT}</FieldHint>
          <CredentialField
            label="Service Account JSON"
            valueName={groupsField('service_account_json')}
            envName={groupsField('service_account_json_env')}
            storedName={groupsField('service_account_json_path')}
            rule={rule}
            secret
          />
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
