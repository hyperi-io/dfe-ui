import {
  CreateUpdateOidcProviderFormData,
  DEFAULT_GROUP_RESOLUTION,
} from '@/core/validationSchemas/oidcProviders.schema';

export const PROVIDERS: readonly {
  key: string;
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
      groups: DEFAULT_GROUP_RESOLUTION,
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
      groups: DEFAULT_GROUP_RESOLUTION,
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
      groups: DEFAULT_GROUP_RESOLUTION,
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
      groups: DEFAULT_GROUP_RESOLUTION,
    },
  },
]);

export const PROVIDERS_MAP = Object.freeze(
  PROVIDERS.reduce(
    (acc, provider) => {
      acc[provider.key] = provider;
      return acc;
    },
    {} as Record<(typeof PROVIDERS)[number]['key'], (typeof PROVIDERS)[number]>,
  ),
);

export const GROUP_MODE_OPTIONS = [
  { label: 'Manual', value: 'manual' },
  { label: 'Token Claim', value: 'token_claim' },
  { label: 'API', value: 'api' },
];

export const GROUPS_FORM_NAME = 'groups';
