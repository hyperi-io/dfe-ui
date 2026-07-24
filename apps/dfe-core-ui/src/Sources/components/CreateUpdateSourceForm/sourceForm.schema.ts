import { MAX_VIEWS } from '@/Sources/components/CreateUpdateSourceForm/ViewsTabContent/constants';
import { TSourceCreateRequestBody } from '@/Sources/hooks/useCreateSource/types';
import { sourceNameValidator } from '@/Sources/utils/validation';

import z from 'zod';

const AUTH_TYPES = ['none', 'oauth2', 'api_key'] as const;
export const MATCH_OPERATORS = [
  'equals',
  'exists',
  'includes',
  'starts_with',
  'ends_with',
  'not_equals',
] as TSourceCreateRequestBody['match']['operator'][];

const sourceDetailsTabSchema = {
  source: sourceNameValidator,
  display_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  enabled: z.boolean({ message: 'Enabled is required' }),
};

const originTabSchema = {
  match: z
    .object({
      field: z.string().min(1, { message: 'Field is required' }),
      operator: z
        .enum(MATCH_OPERATORS, { message: 'Operator is required' })
        .optional(),
      value: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      if (!data.operator) {
        ctx.addIssue({
          code: 'custom',
          message: 'Operator is required',
          path: ['operator'],
        });
        return;
      }
      if (data.operator === 'exists') {
        return;
      }
      if (!data.value?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Value is required',
          path: ['value'],
        });
      }
    }),
  fetcher: z
    .object({
      source_type: z
        .string({ message: 'Source type is required' })
        .optional()
        .nullable(),
      base_url: z.string({ message: 'Base URL is required' }),
      poll_interval_secs: z.number({
        message: 'Poll interval is required',
      }),
      auth: z
        .object({
          type: z
            .string({ message: 'Auth type is required' })
            .min(1, { message: 'Auth type is required' })
            .refine((v) => (AUTH_TYPES as readonly string[]).includes(v), {
              message: 'Auth type is required',
            }),
          token_url: z.string().optional().nullable(),
          client_id: z.string().optional().nullable(),
          client_secret: z.string().optional().nullable(),
          api_key: z.string().optional().nullable(),
        })
        .superRefine((data, ctx) => {
          if (data.type === 'oauth2') {
            if (!data.token_url?.trim()) {
              ctx.addIssue({
                code: 'custom',
                message: 'Token URL is required',
                path: ['token_url'],
              });
            }
            if (!data.client_id?.trim()) {
              ctx.addIssue({
                code: 'custom',
                message: 'Client ID is required',
                path: ['client_id'],
              });
            }
            if (!data.client_secret?.trim()) {
              ctx.addIssue({
                code: 'custom',
                message: 'Client secret is required',
                path: ['client_secret'],
              });
            }
          }
          if (data.type === 'api_key') {
            if (!data.api_key?.trim()) {
              ctx.addIssue({
                code: 'custom',
                message: 'API key is required',
                path: ['api_key'],
              });
            }
          }
        }),
    })
    .optional()
    .nullable(),
};

const schemaConfigTabSchema = {
  schema: z
    .object({
      meta_schema: z.string({ message: 'Meta schema is required' }),
      meta_schema_version: z.string({
        message: 'Meta schema version is required',
      }),
      ttl_days: z.number().optional().nullable(),
      engine: z.string({ message: 'Engine is required' }),
    })
    .optional(),
  header: z
    .object({
      type: z.string({ message: 'Header type is required' }),
      version: z.string({ message: 'Header version is required' }),
    })
    .optional(),
};

const transformTabSchema = {
  transform: z
    .object({
      engine: z.string().min(1, { message: 'Engine is required' }),
      config_file: z.string().optional().nullable(),
      env: z
        .array(
          z.object({
            key: z.string().min(1, { message: 'Key is required' }),
            value: z.string().min(1, { message: 'Value is required' }),
          }),
        )
        .optional(),
      files: z.array(z.string()).optional(),
    })
    .optional()
    .nullable(),
};

export const customMappingsFormSchema = z
  .array(
    z.object({
      key: z.string().min(1, { message: 'Key is required' }),
      value: z.string().min(1, { message: 'Value is required' }),
    }),
  )
  .optional();

const viewsTabSchema = {
  views: z
    .array(
      z.object({
        standard: z.string().min(1, { message: 'Standard is required' }),
        field_map: z.string().optional().nullable(),
        custom_mappings: customMappingsFormSchema,
        taxonomy: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
        service: z.string().optional().nullable(),
      }),
    )
    .max(MAX_VIEWS, {
      message: `Maximum of ${MAX_VIEWS} views can be added (one per standard)`,
    })
    .optional()
    .nullable(),
};

export const formSchema = z.object({
  ...sourceDetailsTabSchema,
  ...originTabSchema,
  ...schemaConfigTabSchema,
  ...transformTabSchema,
  ...viewsTabSchema,
});

export type CreateUpdateSourceFormData = z.input<typeof formSchema>;

const sourceDetailsTabFormKeys = Object.keys(sourceDetailsTabSchema);
const originTabFormKeys = Object.keys(originTabSchema);
const schemaConfigTabFormKeys = Object.keys(schemaConfigTabSchema);
const transformTabFormKeys = Object.keys(transformTabSchema);
const viewsTabFormKeys = Object.keys(viewsTabSchema);

export const TAB_FORM_VALIDATION_KEY_MAP = {
  sourceDetails: sourceDetailsTabFormKeys,
  origin: originTabFormKeys,
  schemaConfig: schemaConfigTabFormKeys,
  transform: transformTabFormKeys,
  views: viewsTabFormKeys,
};
