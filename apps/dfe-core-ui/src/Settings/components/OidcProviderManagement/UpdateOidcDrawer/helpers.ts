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

const toGroupsRequest = (
  form: Partial<TGroupsForm> & Pick<TGroupsForm, 'mode'>,
  stored: TOidcProviderListItem['groups'],
): TGroupsRequest => {
  const groups = {
    mode: form.mode,
    claim_name: form.claim_name ?? stored.claim_name,
    sync_interval: form.sync_interval ?? stored.sync_interval,
    enrich_on_login: form.enrich_on_login ?? stored.enrich_on_login,
    service_account_json_env:
      form.service_account_json_env ?? stored.service_account_json_env,
    admin_email: form.admin_email ?? stored.admin_email,
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
 * block, so a group field the form did not render keeps its stored value. An
 * empty secret is omitted, and name, type and issuer are not sent because the
 * update endpoint does not accept them.
 */
export const toUpdateOidcProviderBody = (
  values: TUpdateOidcProviderFormValues,
  stored: TOidcProviderListItem,
): TOidcProviderUpdateRequestBody => {
  const { groups } = values;

  return {
    enabled: values.enabled,
    display_name: values.display_name,
    client_id: values.client_id,
    client_id_env: values.client_id_env,
    client_secret_env: values.client_secret_env,
    ...(values.client_secret ? { client_secret: values.client_secret } : {}),
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
