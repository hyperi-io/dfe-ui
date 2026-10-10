import {
  GROUP_MODE_LABELS,
  GROUP_MODES_BY_TYPE,
  type TOidcProviderType,
} from '@/core/helpers/oidcProviderFieldRules';
import {
  CreateUpdateOidcProviderFormData,
  defaultGroupResolution,
} from '@/core/validationSchemas/oidcProviders.schema';

export const PROVIDERS: readonly {
  key: TOidcProviderType;
  name: string;
  description: React.ReactNode;
  initialValues: Partial<CreateUpdateOidcProviderFormData>;
}[] = Object.freeze([
  {
    key: 'google',
    name: 'Google',
    description: <>Configure Google as an OIDC provider</>,
    initialValues: {
      name: 'google',
      type: 'google',
      display_name: 'Google',
      issuer: 'https://accounts.google.com',
      client_id_env: 'GOOGLE_CLIENT_ID',
      groups: defaultGroupResolution('google'),
    },
  },
  {
    key: 'entra_id',
    name: 'Entra ID',
    description: <>Configure Entra ID as an OIDC provider</>,
    initialValues: {
      name: 'entra_id',
      type: 'entra_id',
      display_name: 'Entra ID',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
      client_id_env: 'ENTRA_ID_CLIENT_ID',
      groups: defaultGroupResolution('entra_id'),
    },
  },
  {
    key: 'okta',
    name: 'Okta',
    description: <>Configure Okta as an OIDC provider</>,
    initialValues: {
      name: 'okta',
      type: 'okta',
      display_name: 'Okta',
      issuer: 'https://okta.com',
      client_id_env: 'OKTA_CLIENT_ID',
      groups: defaultGroupResolution('okta'),
    },
  },
  {
    key: 'generic',
    name: 'Custom OIDC Provider',
    description: <>Configure custom OIDC provider</>,
    initialValues: {
      name: 'custom_oidc',
      type: 'generic',
      display_name: 'Custom OIDC',
      issuer: 'https://your-custom-oidc-provider.com',
      client_id_env: 'CUSTOM_OIDC_CLIENT_ID',
      groups: defaultGroupResolution('generic'),
    },
  },
]);

export const PROVIDERS_MAP = Object.freeze(
  PROVIDERS.reduce(
    (acc, provider) => {
      acc[provider.key] = provider;
      return acc;
    },
    {} as Record<string, (typeof PROVIDERS)[number]>,
  ),
);

/** The group modes the engine accepts for a provider type. */
export const groupModeOptions = (type: TOidcProviderType) =>
  GROUP_MODES_BY_TYPE[type].map((mode) => ({
    label: GROUP_MODE_LABELS[mode],
    value: mode,
  }));

export const GROUPS_FORM_NAME = 'groups';

export const MANUAL_MODE_HINT =
  "Group membership is managed in DFE. The token's groups are ignored and nothing syncs.";

export const GOOGLE_SERVICE_ACCOUNT_HINT =
  'Optional. For the group sync, and for logins whose own token cannot read their groups.';

export const ENTRA_API_SECRET_HINT =
  'The directory secret is optional: the login client secret is used when both are empty.';

export const ENTRA_TOKEN_CLAIM_HINT =
  'Optional. Read only when a user is in too many groups for the token to list them.';

export const SCOPES_PLACEHOLDER = 'Provider type default';
