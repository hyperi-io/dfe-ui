/**
 * The OIDC provider field rules the engine checks before it writes a provider
 * (dfe-engine auth/oidc/field_rules.py). The provider forms offer only what
 * these accept and send nothing they refuse.
 */

export type TOidcProviderType = 'google' | 'entra_id' | 'okta' | 'generic';
export type TGroupMode = 'manual' | 'token_claim' | 'api';
type TTypeMode = `${TOidcProviderType}:${TGroupMode}`;

export const GROUP_MODES_BY_TYPE: Readonly<
  Record<TOidcProviderType, readonly TGroupMode[]>
> = {
  entra_id: ['manual', 'token_claim', 'api'],
  generic: ['manual', 'token_claim'],
  google: ['api'],
  okta: ['manual', 'token_claim', 'api'],
};

// The (type, mode) pairs that use each directory field; the engine refuses it, when set, from every other pair.
const DIRECTORY_FIELD_USERS = {
  api_token: ['okta:api'],
  api_token_env: ['okta:api'],
  client_secret: ['entra_id:api', 'entra_id:token_claim'],
  client_secret_env: ['entra_id:api', 'entra_id:token_claim'],
  domain: ['google:api'],
  enrich_on_login: ['google:api', 'okta:api'],
  okta_domain: ['okta:api'],
  service_account_json: ['google:api'],
  service_account_json_env: ['google:api'],
  tenant_id: ['entra_id:api', 'entra_id:token_claim'],
  tenant_id_env: ['entra_id:api', 'entra_id:token_claim'],
} as const satisfies Record<string, readonly TTypeMode[]>;

export type TDirectoryField = keyof typeof DIRECTORY_FIELD_USERS;
type TDirectoryTextField = Exclude<TDirectoryField, 'enrich_on_login'>;

const DIRECTORY_TEXT_FIELDS = Object.keys(DIRECTORY_FIELD_USERS).filter(
  (field): field is TDirectoryTextField => field !== 'enrich_on_login',
);

// The group settings the engine reads in one mode and ignores in the others.
const MODE_SETTING_USERS = {
  claim_name: ['token_claim'],
  sync_interval: ['api'],
} as const satisfies Record<string, readonly TGroupMode[]>;

export type TModeSetting = keyof typeof MODE_SETTING_USERS;

export const PROVIDER_TYPE_LABELS: Readonly<Record<TOidcProviderType, string>> =
  {
    entra_id: 'Entra ID',
    generic: 'custom OIDC',
    google: 'Google',
    okta: 'Okta',
  };

export const isOidcProviderType = (
  value: unknown,
): value is TOidcProviderType =>
  typeof value === 'string' && Object.hasOwn(GROUP_MODES_BY_TYPE, value);

export const isGroupModeAllowed = (
  type: TOidcProviderType,
  mode: TGroupMode,
): boolean => GROUP_MODES_BY_TYPE[type].includes(mode);

export const isDirectoryFieldUsed = (
  field: TDirectoryField,
  type: TOidcProviderType,
  mode: TGroupMode,
): boolean =>
  (DIRECTORY_FIELD_USERS[field] as readonly TTypeMode[]).includes(
    `${type}:${mode}`,
  );

export const isModeSettingUsed = (
  setting: TModeSetting,
  mode: TGroupMode,
): boolean =>
  (MODE_SETTING_USERS[setting] as readonly TGroupMode[]).includes(mode);

/** Google tokens carry no groups, so the engine stores every Google provider with enrichment on. */
export const isEnrichOnLoginForced = (type: TOidcProviderType): boolean =>
  type === 'google';

/** Whether the operator chooses Enrich on Login: the engine uses it only for Okta in api mode. */
export const isEnrichOnLoginSettable = (
  type: TOidcProviderType,
  mode: TGroupMode,
): boolean =>
  !isEnrichOnLoginForced(type) &&
  isDirectoryFieldUsed('enrich_on_login', type, mode);

/** The group mode a new provider of this type starts in. */
export const defaultGroupMode = (type: TOidcProviderType): TGroupMode =>
  type === 'google' ? 'api' : 'manual';

type TGroupsValues = { mode: TGroupMode; enrich_on_login?: boolean } & Partial<
  Record<TDirectoryTextField, string>
>;

/**
 * The groups block with every directory field the type and mode do not use
 * cleared. The engine refuses such a field only when it is set, and a groups
 * block it receives replaces the stored one, so a cleared field is dropped.
 */
export const toAllowedGroups = <T extends TGroupsValues>(
  groups: T,
  type: TOidcProviderType,
): T => {
  const allowed: T = { ...groups };
  for (const field of DIRECTORY_TEXT_FIELDS) {
    if (allowed[field] && !isDirectoryFieldUsed(field, type, groups.mode)) {
      allowed[field] = '' as T[typeof field];
    }
  }
  allowed.enrich_on_login =
    isEnrichOnLoginForced(type) ||
    (isEnrichOnLoginSettable(type, groups.mode) && !!groups.enrich_on_login);
  return allowed;
};

/** The secret store paths a saved provider already holds; a value field left empty keeps them. */
export interface TStoredSecretPaths {
  client_secret_path?: string;
  groups?: { api_token_path?: string; client_secret_path?: string };
}

export interface TProviderValues {
  type: TOidcProviderType;
  client_id?: string;
  client_id_env?: string;
  client_secret?: string;
  client_secret_env?: string;
  groups?: TGroupsValues;
}

export interface TFieldProblem {
  path: string[];
  message: string;
}

export const GROUP_MODE_LABELS: Readonly<Record<TGroupMode, string>> = {
  manual: 'Manual',
  token_claim: 'Token Claim',
  api: 'API',
};

const modesLabel = (type: TOidcProviderType) =>
  GROUP_MODES_BY_TYPE[type].map((mode) => GROUP_MODE_LABELS[mode]).join(', ');

const apiModeProblems = (
  values: TProviderValues & { groups: TGroupsValues },
  stored: TStoredSecretPaths,
): TFieldProblem[] => {
  const { groups } = values;
  switch (values.type) {
    case 'okta': {
      const problems: TFieldProblem[] = [];
      if (!groups.okta_domain) {
        problems.push({
          path: ['groups', 'okta_domain'],
          message: 'Okta Domain is required in API mode',
        });
      }
      if (
        !groups.api_token &&
        !groups.api_token_env &&
        !stored.groups?.api_token_path
      ) {
        problems.push({
          path: ['groups', 'api_token'],
          message: 'Enter an API token or its environment variable',
        });
      }
      return problems;
    }
    case 'entra_id': {
      const problems: TFieldProblem[] = [];
      if (!groups.tenant_id && !groups.tenant_id_env) {
        problems.push({
          path: ['groups', 'tenant_id'],
          message: 'Enter a tenant ID or its environment variable',
        });
      }
      const hasDirectorySecret =
        groups.client_secret ||
        groups.client_secret_env ||
        stored.groups?.client_secret_path;
      const hasLoginSecret =
        values.client_secret ||
        values.client_secret_env ||
        stored.client_secret_path;
      if (!hasDirectorySecret && !hasLoginSecret) {
        problems.push({
          path: ['groups', 'client_secret'],
          message:
            'Enter a directory secret or its environment variable, or a login client secret',
        });
      }
      return problems;
    }
    default:
      return [];
  }
};

/**
 * Every required-field rule the engine would refuse these values on. Fields the
 * type and mode do not use are not checked here: {@link toAllowedGroups} clears
 * them before a request is sent.
 */
export const oidcProviderProblems = (
  values: TProviderValues,
  stored: TStoredSecretPaths = {},
): TFieldProblem[] => {
  const problems: TFieldProblem[] = [];
  if (!values.client_id && !values.client_id_env) {
    problems.push({
      path: ['client_id'],
      message: 'Enter a Client ID or its environment variable',
    });
  }
  const { groups } = values;
  if (!groups) {
    return problems;
  }
  if (!isGroupModeAllowed(values.type, groups.mode)) {
    problems.push({
      path: ['groups', 'mode'],
      message: `A ${PROVIDER_TYPE_LABELS[values.type]} provider supports only these modes: ${modesLabel(values.type)}`,
    });
    return problems;
  }
  if (groups.mode === 'api') {
    problems.push(...apiModeProblems({ ...values, groups }, stored));
  }
  return problems;
};
