import { MAX_VIEWS } from '@/Sources/components/CreateUpdateSourceForm/ViewsTabContent/constants';
import { TSourceCreateRequestBody } from '@/Sources/hooks/useCreateSource/types';
import {
  ENGINE_OWNED_FETCHER_KEYS,
  parseFetcherConfig,
} from '@/Sources/utils/transformSourceData/helpers';
import { sourceNameValidator } from '@/Sources/utils/validation';

import z from 'zod';

type TSourceMatch = NonNullable<TSourceCreateRequestBody['match']>;
type TSourceFetcher = NonNullable<TSourceCreateRequestBody['fetcher']>;

export const MATCH_OPERATORS = [
  'equals',
  'exists',
  'includes',
  'starts_with',
  'ends_with',
  'not_equals',
] as TSourceMatch['operator'][];

/** A source is receiver-based or fetcher-based; the engine refuses both or neither. */
export const SOURCE_ORIGINS = ['receiver', 'fetcher'] as const;
export type SourceOrigin = (typeof SOURCE_ORIGINS)[number];

export const FETCHER_TOPICS = ['own', 'main'] as const;

export const FETCHER_TOPIC_LABELS: Record<TSourceFetcher['topic'], string> = {
  own: 'Own topic and table',
  main: 'Shared main table',
};

const sourceDetailsTabSchema = {
  source: sourceNameValidator,
  display_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  enabled: z.boolean({ message: 'Enabled is required' }),
};

/**
 * Both origin blocks stay loose here: which one has to be filled in depends on
 * the selected origin, so the rules live in the cross-field refinement below.
 */
const originTabSchema = {
  origin: z.enum(SOURCE_ORIGINS, { message: 'Origin is required' }),
  match: z
    .object({
      field: z.string().optional().nullable(),
      operator: z.enum(MATCH_OPERATORS).optional().nullable(),
      value: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  fetcher: z
    .object({
      source_type: z.string().optional().nullable(),
      topic: z.enum(FETCHER_TOPICS).optional().nullable(),
      // YAML text in the form; an object on the wire.
      config: z.string().optional().nullable(),
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

export const formSchema = z
  .object({
    ...sourceDetailsTabSchema,
    ...originTabSchema,
    ...schemaConfigTabSchema,
    ...transformTabSchema,
    ...viewsTabSchema,
  })
  .superRefine((data, ctx) => {
    if (data.origin === 'fetcher') {
      if (!data.fetcher?.source_type?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Source type is required',
          path: ['fetcher', 'source_type'],
        });
      }

      const parsed = parseFetcherConfig(data.fetcher?.config);
      if (!parsed.ok) {
        ctx.addIssue({
          code: 'custom',
          message: parsed.message,
          path: ['fetcher', 'config'],
        });
        return;
      }

      const engineOwned = ENGINE_OWNED_FETCHER_KEYS.filter(
        (key) => key in parsed.config,
      );
      if (engineOwned.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: `The engine sets ${engineOwned.join(' and ')}; remove ${engineOwned.length > 1 ? 'them' : 'it'} from the config`,
          path: ['fetcher', 'config'],
        });
      }
      return;
    }

    if (!data.match?.field?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Field is required',
        path: ['match', 'field'],
      });
    }
    if (!data.match?.operator) {
      ctx.addIssue({
        code: 'custom',
        message: 'Operator is required',
        path: ['match', 'operator'],
      });
      return;
    }
    if (data.match.operator !== 'exists' && !data.match.value?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Value is required',
        path: ['match', 'value'],
      });
    }
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
