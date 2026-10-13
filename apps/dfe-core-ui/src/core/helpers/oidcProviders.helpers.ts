import {
  initialCredentialSource,
  isStoredSecret,
} from '@/core/components/CredentialField/credentialSource';
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
  client_id?: string;
  client_id_env?: string;
  client_secret_env?: string;
  client_secret_path?: string;
  groups?: {
    claim_name?: string;
    sync_interval?: number;
    enrich_on_login?: boolean;
    service_account_json_env?: string;
    service_account_json_path?: string;
    domain?: string;
    tenant_id?: string;
    tenant_id_env?: string;
    client_secret_env?: string;
    client_secret_path?: string;
    api_token_env?: string;
    api_token_path?: string;
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

/** A credential as saved: its env var name, its value when it is not a secret, and whether a secret is stored. */
interface TStoredCredential {
  env?: string;
  hasSecret?: boolean;
  value?: string;
}

/** One credential's request fields: nothing while it shows the source it opened on, unedited, or a blank secret value, so the engine keeps what it holds; otherwise the shown member with the other blanked, an env var sent with no secret. A credential the form did not render sends `unrendered`. */
const toCredential = <T extends object>({
  envKey,
  secret,
  stored,
  submitted,
  unrendered,
  valueKey,
}: {
  envKey: keyof T;
  secret: boolean;
  stored: TStoredCredential;
  submitted: T;
  unrendered: TCredential;
  valueKey: keyof T;
}): TCredential => {
  const value = rendered(submitted, valueKey);
  const env = rendered(submitted, envKey);
  const opened = initialCredentialSource({
    env: stored.env,
    hasStoredSecret: !!stored.hasSecret,
    value: stored.value,
  });
  if (value !== undefined) {
    const unedited = secret
      ? value === ''
      : opened === 'value' && value === (stored.value ?? '');
    return unedited ? {} : { env: '', value };
  }
  if (env !== undefined) {
    if (opened === 'env' && env === (stored.env ?? '')) {
      return {};
    }
    return secret ? { env } : { env, value: '' };
  }
  return unrendered;
};

/** A directory secret as saved, from the env var and store path fields that keep it. */
const storedSecret = ({
  env,
  path,
}: {
  env?: string;
  path?: string;
}): TStoredCredential => ({ env, hasSecret: isStoredSecret(path) });

const toGroupsRequest = (
  form: Partial<TGroupResolutionFormData> &
    Pick<TGroupResolutionFormData, 'mode'>,
  stored: NonNullable<TStoredOidcProvider['groups']>,
): TGroupsRequest => {
  // A directory credential is rendered only where the type and mode use it, so an unrendered one carries its stored env var for toAllowedGroups to clear.
  const directorySecret = toCredential({
    envKey: 'client_secret_env',
    secret: true,
    stored: storedSecret({
      env: stored.client_secret_env,
      path: stored.client_secret_path,
    }),
    submitted: form,
    unrendered: { env: stored.client_secret_env },
    valueKey: 'client_secret',
  });
  const apiToken = toCredential({
    envKey: 'api_token_env',
    secret: true,
    stored: storedSecret({
      env: stored.api_token_env,
      path: stored.api_token_path,
    }),
    submitted: form,
    unrendered: { env: stored.api_token_env },
    valueKey: 'api_token',
  });
  const serviceAccountJson = toCredential({
    envKey: 'service_account_json_env',
    secret: true,
    stored: storedSecret({
      env: stored.service_account_json_env,
      path: stored.service_account_json_path,
    }),
    submitted: form,
    unrendered: { env: stored.service_account_json_env },
    valueKey: 'service_account_json',
  });

  const groups = {
    mode: form.mode,
    claim_name: form.claim_name ?? stored.claim_name,
    sync_interval: form.sync_interval ?? stored.sync_interval,
    enrich_on_login: form.enrich_on_login ?? stored.enrich_on_login,
    domain: form.domain ?? stored.domain,
    okta_domain: form.okta_domain ?? stored.okta_domain,
    // The forms read the tenant from the issuer and carry a stored env var through untouched.
    tenant_id: form.tenant_id ?? stored.tenant_id,
    tenant_id_env: form.tenant_id_env ?? stored.tenant_id_env,
    client_secret: directorySecret.value,
    client_secret_env: directorySecret.env,
    api_token: apiToken.value,
    api_token_env: apiToken.env,
    service_account_json: serviceAccountJson.value,
    service_account_json_env: serviceAccountJson.env,
  };
  // The generated type requires defaulted fields; an omitted credential is kept.
  return groups as TGroupsRequest;
};

/** The PUT body for an OIDC provider edit. The engine replaces the whole groups block, so a group field the form did not render keeps its stored value, and one the type and mode do not use is cleared. A credential is sent only when its source or value changed, scopes only when edited, and name, type and issuer never, because the update endpoint does not accept them. */
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
    stored: { env: stored.client_id_env, value: stored.client_id },
    submitted: values,
    unrendered: {},
    valueKey: 'client_id',
  });
  const clientSecret = toCredential({
    envKey: 'client_secret_env',
    secret: true,
    stored: storedSecret({
      env: stored.client_secret_env,
      path: stored.client_secret_path,
    }),
    submitted: values,
    unrendered: {},
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
