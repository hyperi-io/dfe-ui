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

const toGroupsRequest = (
  form: Partial<TGroupResolutionFormData> &
    Pick<TGroupResolutionFormData, 'mode'>,
  stored: NonNullable<TStoredOidcProvider['groups']>,
): TGroupsRequest => {
  const groups = {
    mode: form.mode,
    claim_name: form.claim_name ?? stored.claim_name,
    sync_interval: form.sync_interval ?? stored.sync_interval,
    enrich_on_login: form.enrich_on_login ?? stored.enrich_on_login,
    service_account_json_env:
      form.service_account_json_env ?? stored.service_account_json_env,
    domain: form.domain ?? stored.domain,
    tenant_id: form.tenant_id ?? stored.tenant_id,
    tenant_id_env: form.tenant_id_env ?? stored.tenant_id_env,
    client_secret_env: form.client_secret_env ?? stored.client_secret_env,
    api_token_env: form.api_token_env ?? stored.api_token_env,
    okta_domain: form.okta_domain ?? stored.okta_domain,
    ...(form.service_account_json
      ? { service_account_json: form.service_account_json }
      : {}),
    ...(form.client_secret ? { client_secret: form.client_secret } : {}),
    ...(form.api_token ? { api_token: form.api_token } : {}),
  };
  // The generated type requires defaulted fields; an omitted secret is kept.
  return groups as TGroupsRequest;
};

/**
 * The PUT body for an OIDC provider edit. The engine replaces the whole groups
 * block, so a group field the form did not render keeps its stored value, and
 * one the type and mode do not use is cleared. An empty secret is omitted,
 * scopes are sent only when edited, and name, type and issuer are not sent
 * because the update endpoint does not accept them.
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

  return {
    enabled: values.enabled,
    display_name: values.display_name,
    client_id: values.client_id,
    client_id_env: values.client_id_env,
    client_secret_env: values.client_secret_env,
    ...(values.client_secret ? { client_secret: values.client_secret } : {}),
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
