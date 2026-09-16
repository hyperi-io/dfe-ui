import z from 'zod';
import { DB_NAME_VALIDATOR } from './utils';

export const groupResolutionRequestSchema = z.object({
  mode: z.enum(['manual', 'token_claim', 'api']),
  claim_name: z.string(),
  sync_interval: z.number(),
  service_account_json_env: z.string(),
  enrich_on_login: z.boolean(),
  admin_email: z.string(),
  domain: z.string(),
  tenant_id_env: z.string(),
  client_secret_env: z.string(),
  api_token_env: z.string(),
  okta_domain: z.string(),
  service_account_json_path: z.string(),
});

export const DEFAULT_GROUP_RESOLUTION: z.infer<
  typeof groupResolutionRequestSchema
> = {
  mode: 'manual',
  claim_name: '',
  sync_interval: 3600,
  service_account_json_env: '',
  enrich_on_login: true,
  admin_email: '',
  domain: '',
  tenant_id_env: '',
  client_secret_env: '',
  api_token_env: '',
  okta_domain: '',
  service_account_json_path: '',
};

export const createUpdateOidcProviderSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((value) => DB_NAME_VALIDATOR.regex.test(value), {
      message: DB_NAME_VALIDATOR.message('Name'),
    }),
  enabled: z.boolean().default(true),
  type: z.enum(['google', 'entra_id', 'okta', 'generic']),
  display_name: z.string(),
  issuer: z.string(),
  groups: groupResolutionRequestSchema.optional(),
  scopes: z.string().optional(),
});

export type CreateUpdateOidcProviderFormData = z.infer<
  typeof createUpdateOidcProviderSchema
>;
