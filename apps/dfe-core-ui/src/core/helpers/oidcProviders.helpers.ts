import {
  isOidcProviderType,
  toAllowedGroups,
} from '@/core/helpers/oidcProviderFieldRules';
import { TCreateOidcProviderRequest } from '@/core/hooks/useCreateOidcProvider/types';
import { TOidcProviderUpdateRequestBody } from '@/core/hooks/useUpdateOidcProvider/types';
import {
  CreateUpdateOidcProviderFormData,
  TGroupResolutionFormData,
} from '@/core/validationSchemas/oidcProviders.schema';

type TScopes = string | readonly string[] | null | undefined;

const splitScopes = (value: string): string[] =>
  value.split(/\s+/).filter(Boolean);

/** Scopes as a list, from a provider's list or the setup status's string. */
export const toScopeList = (scopes: TScopes): string[] =>
  typeof scopes === 'string'
    ? splitScopes(scopes)
    : (scopes ?? []).flatMap(splitScopes);

/**
 * The scopes field a create or update sends. An empty list is omitted because
 * the engine refuses one, and a list equal to `current` is omitted so a save
 * never pins the provider type's default scopes.
 */
export const toScopesRequest = (
  scopes: TScopes,
  current?: TScopes,
): { scopes?: string[] } => {
  const list = toScopeList(scopes);
  const unchanged =
    current !== undefined && list.join(' ') === toScopeList(current).join(' ');
  return list.length > 0 && !unchanged ? { scopes: list } : {};
};

/** The POST body for a new OIDC provider: only the group fields its type and mode use are set. */
export const toCreateOidcProviderBody = ({
  scopes,
  groups,
  ...values
}: CreateUpdateOidcProviderFormData): TCreateOidcProviderRequest => ({
  ...values,
  ...toScopesRequest(scopes),
  ...(groups ? { groups: toAllowedGroups(groups, values.type) } : {}),
});

type TGroupsRequest = NonNullable<TOidcProviderUpdateRequestBody['groups']>;

/** A saved provider as the provider list, the setup status or a create response carries it. */
export interface TStoredOidcProvider {
  type: string;
  scopes?: TScopes;
  groups?: {
    claim_name?: string;
    sync_interval?: number;
    enrich_on_login?: boolean;
    service_account_json_env?: string;
    domain?: string;
    tenant_id?: string;
    tenant_id_env?: string;
    client_secret_env?: string;
    api_token_env?: string;
    okta_domain?: string;
  };
}

/** The form submits only the fields it rendered, so any of them may be absent. */
export type TUpdateOidcProviderFormValues = Partial<
  Omit<CreateUpdateOidcProviderFormData, 'groups'>
> & {
  groups?: Partial<TGroupResolutionFormData>;
};

/** A credential as a value and the name of the env var that can supply it. */
interface TCredential {
  value?: string;
  env?: string;
}

/** The form submits a field it rendered as a key even while unset, and leaves out one it did not render. */
const rendered = <T extends object>(values: T, key: keyof T) => {
  if (!(key in values)) {
    return undefined;
  }
  const value = values[key];
  return typeof value === 'string' ? value : '';
};

/** One credential's request fields from whichever member the form rendered, with the other member blanked; a secret value is sent only when typed, and a credential the form did not render falls back to `stored`. */
const toCredential = <T extends object>({
  envKey,
  secret,
  stored,
  submitted,
  valueKey,
}: {
  envKey: keyof T;
  secret: boolean;
  stored: TCredential;
  submitted: T;
  valueKey: keyof T;
}): TCredential => {
  const value = rendered(submitted, valueKey);
  if (value !== undefined) {
    return secret && !value ? { env: '' } : { env: '', value };
  }
  const env = rendered(submitted, envKey);
  if (env !== undefined) {
    return secret ? { env } : { env, value: '' };
  }
  return stored;
};

const toGroupsRequest = (
  form: Partial<TGroupResolutionFormData> &
    Pick<TGroupResolutionFormData, 'mode'>,
  stored: NonNullable<TStoredOidcProvider['groups']>,
): TGroupsRequest => {
  const tenantId = toCredential({
    envKey: 'tenant_id_env',
    secret: false,
    stored: { value: stored.tenant_id, env: stored.tenant_id_env },
    submitted: form,
    valueKey: 'tenant_id',
  });
  const directorySecret = toCredential({
    envKey: 'client_secret_env',
    secret: true,
    stored: { env: stored.client_secret_env },
    submitted: form,
    valueKey: 'client_secret',
  });
  const apiToken = toCredential({
    envKey: 'api_token_env',
    secret: true,
    stored: { env: stored.api_token_env },
    submitted: form,
    valueKey: 'api_token',
  });
  const serviceAccountJson = toCredential({
    envKey: 'service_account_json_env',
    secret: true,
    stored: { env: stored.service_account_json_env },
    submitted: form,
    valueKey: 'service_account_json',
  });

  const groups = {
    mode: form.mode,
    claim_name: form.claim_name ?? stored.claim_name,
    sync_interval: form.sync_interval ?? stored.sync_interval,
    enrich_on_login: form.enrich_on_login ?? stored.enrich_on_login,
    domain: form.domain ?? stored.domain,
    okta_domain: form.okta_domain ?? stored.okta_domain,
    tenant_id: tenantId.value,
    tenant_id_env: tenantId.env,
    client_secret: directorySecret.value,
    client_secret_env: directorySecret.env,
    api_token: apiToken.value,
    api_token_env: apiToken.env,
    service_account_json: serviceAccountJson.value,
    service_account_json_env: serviceAccountJson.env,
  };
  // The generated type requires defaulted fields; an omitted secret is kept.
  return groups as TGroupsRequest;
};

/**
 * The PUT body for an OIDC provider edit. The engine replaces the whole groups
 * block, so a group field the form did not render keeps its stored value, and
 * one the type and mode do not use is cleared. Each credential sends the member
 * the form shows and blanks the other, an empty secret is omitted, scopes are
 * sent only when edited, and name, type and issuer are not sent because the
 * update endpoint does not accept them.
 */
export const toUpdateOidcProviderBody = (
  values: TUpdateOidcProviderFormValues,
  stored: TStoredOidcProvider,
): TOidcProviderUpdateRequestBody => {
  const { groups } = values;
  const type = values.type ?? stored.type;
  const merged = groups?.mode
    ? toGroupsRequest({ ...groups, mode: groups.mode }, stored.groups ?? {})
    : undefined;
  const clientId = toCredential({
    envKey: 'client_id_env',
    secret: false,
    stored: {},
    submitted: values,
    valueKey: 'client_id',
  });
  const clientSecret = toCredential({
    envKey: 'client_secret_env',
    secret: true,
    stored: {},
    submitted: values,
    valueKey: 'client_secret',
  });

  return {
    enabled: values.enabled,
    display_name: values.display_name,
    ...(clientId.value === undefined ? {} : { client_id: clientId.value }),
    ...(clientId.env === undefined ? {} : { client_id_env: clientId.env }),
    ...(clientSecret.value === undefined
      ? {}
      : { client_secret: clientSecret.value }),
    ...(clientSecret.env === undefined
      ? {}
      : { client_secret_env: clientSecret.env }),
    ...toScopesRequest(values.scopes, stored.scopes),
    ...(merged
      ? {
          groups: isOidcProviderType(type)
            ? toAllowedGroups(merged, type)
            : merged,
        }
      : {}),
  };
};
