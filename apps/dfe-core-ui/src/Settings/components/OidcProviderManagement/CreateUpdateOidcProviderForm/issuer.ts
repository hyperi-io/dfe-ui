import {
  PROVIDERS,
  PROVIDERS_MAP,
} from '@/core/constants/oidcProviders.constants';

export type TIssuerMode = 'guided' | 'manual';

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

/** The Okta org issuer, '' until the domain is filled in; a pasted org URL is reduced to its host. */
export const buildOktaIssuer = ({ domain }: TOktaIssuerParts) => {
  const host = domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  return host === '' ? '' : `https://${host}`;
};

/** The host of an issuer URL, where the Okta API is called, or '' when there is no issuer. */
export const oktaDomainFromIssuer = ({ issuer }: { issuer: string }) =>
  issuer
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[0] ?? '';

/** The tenant an Entra ID issuer URL names in its first path segment, or '' when there is none. */
export const entraTenantFromIssuer = ({ issuer }: { issuer: string }) =>
  issuer
    .trim()
    .replace(/^https?:\/\//i, '')
    .split('/')[1] ?? '';

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
