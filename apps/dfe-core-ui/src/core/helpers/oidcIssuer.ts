import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';
import type { TOidcProviderType } from '@/core/helpers/oidcProviderFieldRules';

export type TIssuerMode = 'guided' | 'manual';

// The Entra ID authority paths that stand for many tenants rather than one directory.
const ENTRA_MULTI_TENANT_ALIASES = ['common', 'organizations', 'consumers'];

const ENTRA_TENANT_GUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The hosts Okta serves its own org domains under, which tell no two Okta orgs apart.
const OKTA_HOST_SUFFIX = /\.(okta|oktapreview|okta-emea|okta-gov)\.com$/i;

export interface TOktaIssuerParts {
  domain: string;
}

export interface TEntraIssuerParts {
  tenantId: string;
}

/** The entry modes, each named for what the user types: the one value the issuer is built from, or the full URL. */
export const issuerModeOptions = ({
  type,
}: {
  type: 'okta' | 'entra_id';
}): { label: string; value: TIssuerMode }[] => [
  { label: type === 'okta' ? 'Domain' : 'Tenant ID', value: 'guided' },
  { label: 'Full URL', value: 'manual' },
];

const PRESET_ISSUERS = PROVIDERS.map(
  (provider) => provider.initialValues.issuer,
);

/** An issuer the user typed, as opposed to an empty one, a preset or one the guided fields built. */
const isTypedIssuer = (
  issuer: unknown,
  built: (string | undefined)[],
): issuer is string =>
  typeof issuer === 'string' &&
  issuer !== '' &&
  !built.includes(issuer) &&
  !PRESET_ISSUERS.includes(issuer);

/** The Okta issuer, https:// and the domain, '' until the domain is filled in; a pasted URL loses its scheme and trailing slashes but keeps any path. */
export const buildOktaIssuer = ({ domain }: TOktaIssuerParts) => {
  const host = domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  return host === '' ? '' : `https://${host}`;
};

/** The host of an issuer URL, where the Okta API is called, or '' when there is no issuer. */
export const issuerHost = ({ issuer }: { issuer: string }) =>
  issuer
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0] ?? '';

/** The tenant an Entra ID issuer URL names in its first path segment, or '' when there is none or it is a multi-tenant alias, which names no directory. */
export const entraTenantFromIssuer = ({ issuer }: { issuer: string }) => {
  const segment =
    issuer
      .trim()
      .replace(/^https?:\/\//i, '')
      .split('/')[1] ?? '';
  return ENTRA_MULTI_TENANT_ALIASES.includes(segment.toLowerCase())
    ? ''
    : segment;
};

/** The v2.0 issuer of an Entra ID tenant in the global cloud, '' until the tenant ID is filled in. */
export const buildEntraIssuer = ({ tenantId }: TEntraIssuerParts) => {
  const tenant = tenantId.trim();
  return tenant === ''
    ? ''
    : `https://login.microsoftonline.com/${tenant}/v2.0`;
};

/** The issuer and entry mode a Type change gives: Google always takes its fixed issuer, a typed issuer is kept for Manual entry, and anything else takes the new type's built issuer or its preset. */
export const issuerOnTypeChange = ({
  built,
  current,
  type,
}: {
  built: Partial<Record<string, string>>;
  current: unknown;
  type: string;
}): { issuer: string; mode: TIssuerMode } => {
  const preset = PROVIDERS_MAP[type]?.initialValues.issuer ?? '';

  if (type === 'google') {
    return { issuer: preset, mode: 'guided' };
  }
  if (isTypedIssuer(current, Object.values(built))) {
    return { issuer: current, mode: 'manual' };
  }
  return { issuer: built[type] ?? preset, mode: 'guided' };
};

/** What tells one provider from another of its type: the Okta org, the Entra tenant (a tenant ID's first block), the Google domain or a custom issuer's host. */
const distinguishingPart = ({
  issuer,
  trustedEmailDomains,
  type,
}: {
  issuer: string;
  trustedEmailDomains: readonly string[];
  type: TOidcProviderType;
}) => {
  if (type === 'google') {
    return trustedEmailDomains[0] ?? '';
  }
  if (type === 'okta') {
    return issuerHost({ issuer }).replace(OKTA_HOST_SUFFIX, '');
  }
  if (type === 'entra_id') {
    const tenant = entraTenantFromIssuer({ issuer });
    return ENTRA_TENANT_GUID.test(tenant)
      ? tenant.slice(0, 8)
      : (tenant.split('.')[0] ?? '');
  }
  return PRESET_ISSUERS.includes(issuer) ? '' : issuerHost({ issuer });
};

/** The name a new provider is offered: its type's preset name, then what tells it from others of that type once the form holds it. */
export const suggestedProviderName = ({
  issuer,
  trustedEmailDomains,
  type,
}: {
  issuer: string;
  trustedEmailDomains: readonly string[];
  type: TOidcProviderType;
}) => {
  const stem = PROVIDERS_MAP[type]?.initialValues.name ?? type;
  const part = distinguishingPart({ issuer, trustedEmailDomains, type })
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
  return part ? `${stem}-${part}` : stem;
};

/** The env var a provider credential is offered: `DFE_OIDC_`, the provider name in env var form, then `suffix`, as the deploy example names DFE_OIDC_OKTA_CLIENT_ID. '' for a name with no letter or digit. */
export const suggestedCredentialEnv = ({
  name,
  suffix,
}: {
  name: string;
  suffix: 'CLIENT_ID' | 'CLIENT_SECRET';
}) => {
  const stem = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return stem ? `DFE_OIDC_${stem}_${suffix}` : '';
};
