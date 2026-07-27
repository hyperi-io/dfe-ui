import z from 'zod';

export const NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const groupResolutionRequestSchema = z.object({
  mode: z.enum(['manual', 'token_claim', 'api']),
  claim_name: z.string(),
  sync_interval: z.number(),
  // Fetch the user's groups from the directory API at each login. Needed by
  // providers with no groups claim (Google Workspace); Entra's >200 overage is
  // handled automatically without it.
  enrich_on_login: z.boolean().default(false),
  service_account_json_env: z.string(),
  admin_email: z.string(),
  domain: z.string(),
  tenant_id_env: z.string(),
  client_secret_env: z.string(),
  api_token_env: z.string(),
  okta_domain: z.string(),
});

export const DEFAULT_GROUP_RESOLUTION: z.infer<
  typeof groupResolutionRequestSchema
> = {
  mode: 'manual',
  claim_name: 'groups',
  sync_interval: 3600,
  enrich_on_login: false,
  service_account_json_env: '',
  admin_email: '',
  domain: '',
  tenant_id_env: '',
  client_secret_env: '',
  api_token_env: '',
  okta_domain: '',
};

export const createUpdateOidcProviderSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((value) => NAME_REGEX.test(value), {
      message:
        'Name must contain only lowercase letters, numbers, and underscores',
    }),
  enabled: z.boolean().default(true),
  type: z.enum(['google', 'entra_id', 'okta', 'generic']),
  display_name: z.string(),
  issuer: z.string(),
  client_id_env: z.string(),
  // The RP client secret env var name used in the auth-code exchange (distinct
  // from groups.client_secret_env, which backs the Entra Graph sync).
  client_secret_env: z.string().default(''),
  groups: groupResolutionRequestSchema.optional(),
});

export type CreateUpdateOidcProviderFormData = z.infer<
  typeof createUpdateOidcProviderSchema
>;
