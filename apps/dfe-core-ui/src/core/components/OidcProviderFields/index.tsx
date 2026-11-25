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
  PROVIDER_NAME_HINT,
  PROVIDERS,
  SCOPES_PLACEHOLDER,
  TRUSTED_EMAIL_DOMAINS_HINT,
  UNTRUSTED_DOMAINS_WARNING,
} from '@/core/constants/oidcProviders.constants';
import {
  entraTenantFromIssuer,
  issuerHost,
  suggestedCredentialEnv,
  suggestedProviderName,
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
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import {
  Alert,
  Button,
  type FormInstance,
  FormRule,
  Input,
  InputNumber,
  Select,
  Switch,
} from 'antd';
import { useEffect, useRef } from 'react';

const groupsField = (field: string) => [GROUPS_FORM_NAME, field];

const ENRICH_ON_LOGIN_NAME = groupsField('enrich_on_login');
const OKTA_DOMAIN_NAME = groupsField('okta_domain');
const TENANT_ID_NAME = groupsField('tenant_id');
const TENANT_ID_ENV_NAME = groupsField('tenant_id_env');
const TRUSTED_EMAIL_DOMAINS_NAME = 'trusted_email_domains';

const CLIENT_ID_ENV_NAME = 'client_id_env';
const CLIENT_SECRET_ENV_NAME = 'client_secret_env';
const PROVIDER_NAME = 'name';

type TFormValues = Partial<CreateUpdateOidcProviderFormData>;
type TFieldPath = string | string[];

/** The value at `path` in a set of form values. */
const valueAt = (values: object | undefined, path: TFieldPath): unknown =>
  [path]
    .flat()
    .reduce<unknown>(
      (parent, key) =>
        parent && typeof parent === 'object'
          ? (parent as Record<string, unknown>)[key]
          : undefined,
      values,
    );

/** The issuer a set of form values holds, undefined until the form has one to read. */
const issuerOf = ({ issuer }: TFormValues) =>
  typeof issuer === 'string' ? issuer : undefined;

/**
 * Keeps the field `name` set to what `derive` reads from the form while the field is empty, holds what this last filled or holds a type preset, and the field `unlessSet` is empty.
 * `derive` returning undefined leaves the field alone.
 */
const useDerivedField = ({
  derive,
  enabled,
  name,
  unlessSet,
}: {
  derive: (values: TFormValues) => string | undefined;
  enabled: boolean;
  name: TFieldPath;
  unlessSet?: TFieldPath;
}) => {
  const form = Form.useFormInstance();
  const value: string | undefined = Form.useWatch(
    (values: TFormValues) => (enabled ? derive(values) : undefined),
    form,
  );
  const filled = useRef<string>(undefined);

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    const current: unknown = form.getFieldValue(name);
    const isPreset = PROVIDERS.some(
      ({ initialValues }) => valueAt(initialValues, name) === current,
    );
    const isSetElsewhere =
      unlessSet !== undefined && !!form.getFieldValue(unlessSet);
    if (
      !isSetElsewhere &&
      (!current || current === filled.current || isPreset)
    ) {
      form.setFieldValue(name, value);
    }
    filled.current = value;
  }, [form, name, unlessSet, value]);
};

/** Suggests a new provider's name from its type, issuer and trusted domains, and its credential env vars from its name, so a second provider of a type takes neither from the first. */
const useSuggestedNames = ({ enabled }: { enabled: boolean }) => {
  const credentialEnv =
    (suffix: 'CLIENT_ID' | 'CLIENT_SECRET') =>
    ({ name }: TFormValues) =>
      name ? suggestedCredentialEnv({ name, suffix }) : undefined;

  useDerivedField({
    derive: (values) => {
      const issuer = issuerOf(values);
      return issuer !== undefined && isOidcProviderType(values.type)
        ? suggestedProviderName({
            issuer,
            trustedEmailDomains: values.trusted_email_domains ?? [],
            type: values.type,
          })
        : undefined;
    },
    enabled,
    name: PROVIDER_NAME,
  });
  useDerivedField({
    derive: credentialEnv('CLIENT_ID'),
    enabled,
    name: CLIENT_ID_ENV_NAME,
  });
  useDerivedField({
    derive: credentialEnv('CLIENT_SECRET'),
    enabled,
    name: CLIENT_SECRET_ENV_NAME,
  });
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

/** The trusted domains, warning while there are none and offering `suggestedDomain` as one. */
const TrustedEmailDomainsField = ({
  rule,
  suggestedDomain,
}: {
  rule: FormRule;
  suggestedDomain?: string;
}) => {
  const form = Form.useFormInstance();
  // useWatch is undefined until after the first render, so read the store until then.
  const domains: unknown =
    Form.useWatch(TRUSTED_EMAIL_DOMAINS_NAME) ??
    form.getFieldValue(TRUSTED_EMAIL_DOMAINS_NAME);
  const isEmpty = !Array.isArray(domains) || domains.length === 0;
  return (
    <>
      <Form.Item
        className="col-span-2"
        label="Trusted Email Domains"
        name={TRUSTED_EMAIL_DOMAINS_NAME}
        rules={[rule]}
        tooltip={TRUSTED_EMAIL_DOMAINS_HINT}
      >
        <Select
          mode="tags"
          placeholder="corp.com"
          tokenSeparators={[' ', ',']}
          open={false}
          suffixIcon={null}
        />
      </Form.Item>
      {isEmpty && (
        <Alert
          className="col-span-2"
          type="warning"
          showIcon
          message={UNTRUSTED_DOMAINS_WARNING}
          action={
            suggestedDomain && (
              <Button
                size="small"
                onClick={() =>
                  form.setFieldValue(TRUSTED_EMAIL_DOMAINS_NAME, [
                    suggestedDomain,
                  ])
                }
              >
                Trust {suggestedDomain}
              </Button>
            )
          }
        />
      )}
    </>
  );
};

interface OidcLoginFieldsProps {
  rule: FormRule;
  issuerBuilder: TIssuerBuilder;
  disabledFields?: { name?: boolean; issuer?: boolean };
  hasStoredScopes?: boolean;
  /** A domain to offer while Trusted Email Domains is empty. */
  suggestedDomain?: string;
  /** Suggests the name and credential env vars per provider rather than per type. */
  suggestsNames?: boolean;
}

/** The login fields of an OIDC provider form, laid out for a two-column grid. */
export const OidcLoginFields = ({
  rule,
  issuerBuilder,
  disabledFields = {},
  hasStoredScopes = false,
  suggestedDomain,
  suggestsNames = false,
}: OidcLoginFieldsProps) => {
  useSuggestedNames({ enabled: suggestsNames });
  return (
    <>
      <Form.Item
        label="Name"
        name={PROVIDER_NAME}
        rules={[rule]}
        tooltip={PROVIDER_NAME_HINT}
      >
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
        envName={CLIENT_ID_ENV_NAME}
        rule={rule}
        required
      />
      <CredentialField
        label="Client Secret"
        valueName="client_secret"
        envName={CLIENT_SECRET_ENV_NAME}
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
      <TrustedEmailDomainsField rule={rule} suggestedDomain={suggestedDomain} />
    </>
  );
};

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

  useDerivedField({
    derive: (values) => {
      const issuer = issuerOf(values);
      return issuer === undefined ? undefined : issuerHost({ issuer });
    },
    enabled: derivesFromIssuer && providerType === 'okta',
    name: OKTA_DOMAIN_NAME,
  });
  // A provider that stores no tenant, new or edited, takes the one its issuer names; a stored one is left alone.
  useDerivedField({
    derive: (values) => {
      const issuer = issuerOf(values);
      return issuer === undefined
        ? undefined
        : entraTenantFromIssuer({ issuer });
    },
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
      <Form.Item
        label="Mode"
        name={groupsField('mode')}
        rules={[rule]}
        tooltip={mode === 'manual' ? MANUAL_MODE_HINT : undefined}
      >
        <Select disabled={modeOptions.length === 1} options={modeOptions} />
      </Form.Item>

      <Form.Item
        label="Enrich on Login"
        name={ENRICH_ON_LOGIN_NAME}
        rules={[rule]}
      >
        <Switch disabled={isEnrichLocked} />
      </Form.Item>

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
        <CredentialField
          label="Directory Secret"
          valueName={groupsField('client_secret')}
          envName={groupsField('client_secret_env')}
          storedName={groupsField('client_secret_path')}
          rule={rule}
          dependencies={['client_secret', 'client_secret_env']}
          secret
          tooltip={
            mode === 'api' ? ENTRA_API_SECRET_HINT : ENTRA_TOKEN_CLAIM_HINT
          }
        />
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
        <CredentialField
          label="Service Account JSON"
          valueName={groupsField('service_account_json')}
          envName={groupsField('service_account_json_env')}
          storedName={groupsField('service_account_json_path')}
          rule={rule}
          secret
          tooltip={GOOGLE_SERVICE_ACCOUNT_HINT}
        />
      )}

      {uses('domain') && (
        <Form.Item label="Domain" name={groupsField('domain')} rules={[rule]}>
          <Input />
        </Form.Item>
      )}
    </>
  );
};
