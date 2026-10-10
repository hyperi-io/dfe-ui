import {
  defaultGroupMode,
  isEnrichOnLoginForced,
  oidcProviderProblems,
  type TOidcProviderType,
  type TStoredSecretPaths,
} from '@/core/helpers/oidcProviderFieldRules';
import z from 'zod';
import { ENV_VAR_NAME_VALIDATOR, STORE_NAME_VALIDATOR } from './utils';

// An Entra tenant GUID or domain, the shape the engine accepts in the authority URL.
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9.-]{0,252}$/;

const optionalText = () => z.string().default('');

const envVarName = () =>
  z
    .string()
    .refine((value) => !value || ENV_VAR_NAME_VALIDATOR.regex.test(value), {
      message: ENV_VAR_NAME_VALIDATOR.message,
    })
    .default('');

export const groupResolutionRequestSchema = z.object({
  mode: z.enum(['manual', 'token_claim', 'api']),
  claim_name: z.string().default('groups'),
  sync_interval: z
    .number({ error: 'Enter the seconds between group syncs' })
    .int()
    .min(60, { message: 'Sync Interval must be at least 60 seconds' })
    .default(3600),
  enrich_on_login: z.boolean().default(false),
  service_account_json: optionalText(),
  service_account_json_env: envVarName(),
  domain: optionalText(),
  tenant_id: z
    .string()
    .refine((value) => !value || TENANT_ID.test(value), {
      message:
        "Enter the tenant's GUID or its domain, such as contoso.onmicrosoft.com",
    })
    .default(''),
  tenant_id_env: envVarName(),
  client_secret: optionalText(),
  client_secret_env: envVarName(),
  api_token: optionalText(),
  api_token_env: envVarName(),
  okta_domain: optionalText(),
});

export type TGroupResolutionFormData = z.infer<
  typeof groupResolutionRequestSchema
>;

export const DEFAULT_GROUP_RESOLUTION: TGroupResolutionFormData = {
  mode: 'manual',
  claim_name: 'groups',
  sync_interval: 3600,
  service_account_json_env: '',
  enrich_on_login: false,
  domain: '',
  tenant_id_env: '',
  client_secret_env: '',
  api_token_env: '',
  okta_domain: '',
  service_account_json: '',
  client_secret: '',
  api_token: '',
  tenant_id: '',
};

/** The groups block a new provider of this type starts with, one the engine accepts as sent. */
export const defaultGroupResolution = (
  type: TOidcProviderType,
): TGroupResolutionFormData => ({
  ...DEFAULT_GROUP_RESOLUTION,
  mode: defaultGroupMode(type),
  enrich_on_login: isEnrichOnLoginForced(type),
});

const oidcProviderShape = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .refine((value) => STORE_NAME_VALIDATOR.regex.test(value), {
      message: STORE_NAME_VALIDATOR.message('Name'),
    }),
  enabled: z.boolean().default(true),
  type: z.enum(['google', 'entra_id', 'okta', 'generic']),
  display_name: optionalText(),
  issuer: z.string().min(1, { message: 'Issuer is required' }),
  groups: groupResolutionRequestSchema.optional(),
  scopes: z
    .array(z.string())
    .refine((scopes) => scopes.length === 0 || scopes.includes('openid'), {
      message: 'Scopes must include openid, or be left empty',
    })
    .optional(),
  client_id: optionalText(),
  client_id_env: envVarName(),
  client_secret: optionalText(),
  client_secret_env: envVarName(),
});

/**
 * The provider form schema. `stored` names the secrets a saved provider already
 * holds, which satisfy a required credential the form leaves empty.
 */
export const buildOidcProviderSchema = (stored: TStoredSecretPaths = {}) =>
  oidcProviderShape.superRefine((values, ctx) => {
    for (const problem of oidcProviderProblems(values, stored)) {
      ctx.addIssue({
        code: 'custom',
        message: problem.message,
        path: problem.path,
      });
    }
  });

export const createUpdateOidcProviderSchema = buildOidcProviderSchema();

export type CreateUpdateOidcProviderFormData = z.infer<
  typeof oidcProviderShape
>;
