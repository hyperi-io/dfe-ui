import { TOidcProviderUpdateRequestBody } from '@/core/hooks/useUpdateOidcProvider/types';
import { CreateUpdateOidcProviderFormData } from '@/core/validationSchemas/oidcProviders.schema';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';

type TGroupsForm = NonNullable<CreateUpdateOidcProviderFormData['groups']>;
type TGroupsRequest = NonNullable<TOidcProviderUpdateRequestBody['groups']>;

/** The form submits only the fields it rendered, so any of them may be absent. */
export type TUpdateOidcProviderFormValues = Partial<
  Omit<CreateUpdateOidcProviderFormData, 'groups'>
> & {
  groups?: Partial<TGroupsForm>;
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
  form: Partial<TGroupsForm> & Pick<TGroupsForm, 'mode'>,
  stored: TOidcProviderListItem['groups'],
): TGroupsRequest => {
  const tenantId = toCredential({
    envKey: 'tenant_id_env',
    secret: false,
    stored: { value: stored.tenant_id, env: stored.tenant_id_env },
    submitted: form,
    valueKey: 'tenant_id',
  });
  const clientSecret = toCredential({
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
    admin_email: form.admin_email ?? stored.admin_email,
    domain: form.domain ?? stored.domain,
    okta_domain: form.okta_domain ?? stored.okta_domain,
    tenant_id: tenantId.value,
    tenant_id_env: tenantId.env,
    client_secret: clientSecret.value,
    client_secret_env: clientSecret.env,
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
 * block, so a group field the form did not render keeps its stored value. An
 * empty secret is omitted, and name, type and issuer are not sent because the
 * update endpoint does not accept them.
 */
export const toUpdateOidcProviderBody = (
  values: TUpdateOidcProviderFormValues,
  stored: TOidcProviderListItem,
): TOidcProviderUpdateRequestBody => {
  const { groups } = values;
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
    client_id: clientId.value,
    client_id_env: clientId.env,
    client_secret: clientSecret.value,
    client_secret_env: clientSecret.env,
    ...(groups?.mode
      ? {
          groups: toGroupsRequest(
            { ...groups, mode: groups.mode },
            stored.groups,
          ),
        }
      : {}),
  };
};
