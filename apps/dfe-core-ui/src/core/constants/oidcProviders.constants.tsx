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
      client_id_env: 'DFE_OIDC_GOOGLE_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_GOOGLE_CLIENT_SECRET',
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
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
      issuer: '',
      client_id_env: 'DFE_OIDC_ENTRA_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_ENTRA_CLIENT_SECRET',
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
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
      issuer: '',
      client_id_env: 'DFE_OIDC_OKTA_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_OKTA_CLIENT_SECRET',
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
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
      client_id_env: 'DFE_OIDC_CUSTOM_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_CUSTOM_CLIENT_SECRET',
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'token_claim' },
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

type TGroupMode = (typeof DEFAULT_GROUP_RESOLUTION)['mode'];

export const GROUP_MODE_OPTIONS: {
  label: string;
  value: TGroupMode;
}[] = [
  { label: 'Manual', value: 'manual' },
  { label: 'Token Claim', value: 'token_claim' },
  { label: 'API', value: 'api' },
];

/** The group modes the engine accepts for each provider type. */
export const GROUP_MODES_BY_TYPE: Readonly<
  Record<string, readonly TGroupMode[]>
> = Object.freeze({
  entra_id: ['manual', 'token_claim', 'api'],
  generic: ['manual', 'token_claim'],
  google: ['api'],
  okta: ['manual', 'token_claim', 'api'],
});

export const GROUPS_FORM_NAME = 'groups';
