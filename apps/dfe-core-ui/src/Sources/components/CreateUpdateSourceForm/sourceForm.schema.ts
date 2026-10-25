import { MAX_VIEWS } from '@/Sources/components/CreateUpdateSourceForm/ViewsTabContent/constants';
import { TCreateSourceRequestBody } from '@/Sources/hooks/useCreateSource/types';
import {
  ENGINE_OWNED_FETCHER_KEYS,
  parseFetcherConfig,
} from '@/Sources/utils/transformSourceData/helpers';
import { TCompatBinding } from '@/Sources/hooks/useFetchCompat/types';
import {
  isMatchGroup,
  MATCH_NESTING_LIMIT,
  matchDepth,
  operatorTakesValue,
  TMatchFormNode,
  TMatchOperator,
} from '@/Sources/utils/sourceMatch';
import { sourceNameValidator } from '@/Sources/utils/validation';

import z from 'zod';

type TSourceFetcher = NonNullable<TCreateSourceRequestBody['fetcher']>;

/** `always` is the engine's own, reserved for the default source. */
export const MATCH_OPERATORS: TMatchOperator[] = [
  'equals',
  'exists',
  'includes',
  'starts_with',
  'ends_with',
  'not_equals',
];

/** How a receiver source picks its records: conditions, or one CEL Fast expression. */
export const MATCH_MODES = ['conditions', 'expression'] as const;
export type MatchMode = (typeof MATCH_MODES)[number];

/** Whether a source takes the deployment's compatibility profiles or names its own. */
export const COMPAT_MODES = ['inherit', 'own'] as const;
export type CompatMode = (typeof COMPAT_MODES)[number];

/** A source is receiver-based or fetcher-based; the engine refuses both or neither. */
export const SOURCE_ORIGINS = ['receiver', 'fetcher'] as const;
export type SourceOrigin = (typeof SOURCE_ORIGINS)[number];

export const FETCHER_TOPICS = ['own', 'main'] as const;

export const FETCHER_TOPIC_LABELS: Record<TSourceFetcher['topic'], string> = {
  own: 'Own topic and table',
  main: 'Shared table',
};

export const RECEIVER_TABLES = ['own', 'main'] as const;

export const RECEIVER_TABLE_LABELS: Record<
  (typeof RECEIVER_TABLES)[number],
  string
> = {
  own: 'Own table',
  main: 'Shared table',
};

/** Which of a deployment's two transports carries this source's records. */
export const SOURCE_TRANSPORTS = ['bus', 'direct'] as const;

export const SOURCE_TRANSPORT_LABELS: Record<
  (typeof SOURCE_TRANSPORTS)[number],
  string
> = {
  bus: 'Bus - a broker holds records between stages',
  direct: 'Direct - point to point, nothing stored between stages',
};

const sourceDetailsTabSchema = {
  source: sourceNameValidator,
  display_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  enabled: z.boolean({ message: 'Enabled is required' }),
  // Null is a value here, not an omission: it puts the source back on the
  // deployment default, and the engine refuses one the deployment lacks.
  transport: z.enum(SOURCE_TRANSPORTS).optional().nullable(),
  // Required, so a form that lost the value is refused rather than sending none.
  archive: z.boolean({ message: 'Archive is required' }),
};

/**
 * Both origin blocks stay loose here: which one has to be filled in depends on
 * the selected origin, so the rules live in the cross-field refinement below.
 */
const originTabSchema = {
  origin: z.enum(SOURCE_ORIGINS, { message: 'Origin is required' }),

  // A tree of conditions and groups, checked by the origin refinement below,
  // which refuses a blank one only when this source is a receiver.
  match: z.custom<TMatchFormNode>().optional().nullable(),
  // CEL Fast, in place of match. The engine checks it at save.
  when: z.string().optional().nullable(),
  compat_profiles: z.custom<TCompatBinding[]>().optional().nullable(),
  // An alias field left empty holds undefined, and a type error here would skip the refinement below.
  aliases: z
    .record(z.string(), z.array(z.string()).optional().nullable())
    .optional()
    .nullable(),
  fetcher: z
    .object({
      // Same as match: a blank source_type is only refused for fetchers.
      source_type: z.string().optional().nullable(),
      topic: z.enum(FETCHER_TOPICS).optional().nullable(),
      // YAML text in the form; an object on the wire.
      config: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  receiver_ui_config: z
    .object({
      table: z.enum(RECEIVER_TABLES).optional().nullable(),
      match_mode: z.enum(MATCH_MODES).optional().nullable(),
      compat_mode: z.enum(COMPAT_MODES).optional().nullable(),
    })
    .optional()
    .nullable(),
};

type IssueSink = Pick<z.RefinementCtx, 'addIssue'>;

/** Refuse the first blank in each condition, and an empty group, at the path the form shows it on. */
const checkMatchNode = (
  node: TMatchFormNode | null | undefined,
  path: (string | number)[],
  ctx: IssueSink,
) => {
  if (isMatchGroup(node)) {
    const parts = node?.parts ?? [];
    if (parts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'A group needs at least one condition',
        path: [...path, 'parts'],
      });
    }
    parts.forEach((part, index) =>
      checkMatchNode(part, [...path, 'parts', index], ctx),
    );
    return;
  }
  if (!node?.field?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Field is required',
      path: [...path, 'field'],
    });
  }
  if (!node?.operator) {
    ctx.addIssue({
      code: 'custom',
      message: 'Operator is required',
      path: [...path, 'operator'],
    });
    return;
  }
  if (operatorTakesValue(node.operator) && !node.value?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Value is required',
      path: [...path, 'value'],
    });
  }
};

/** A clone or an edit seeds an absent meta schema as '', so blank and unset mean the same. */
const isBlank = (value: string | null | undefined) => !value?.trim();

const schemaConfigTabSchema = {
  schema: z
    .object({
      // The engine accepts a source with no meta schema, so neither is required
      // until one of the two is named. The defaults patch ttl_days and engine
      // into this object on every create, which must not make them so.
      meta_schema: z.string().optional().nullable(),
      meta_schema_version: z.string().optional().nullable(),
      ttl_days: z.number().optional().nullable(),
      // Blank follows the DFE default.
      engine: z.string().optional().nullable(),
    })
    .superRefine((schema, ctx) => {
      const hasSchema = !isBlank(schema.meta_schema);
      const hasVersion = !isBlank(schema.meta_schema_version);
      if (hasVersion && !hasSchema) {
        ctx.addIssue({
          code: 'custom',
          message: 'Meta schema is required',
          path: ['meta_schema'],
        });
      }
      if (hasSchema && !hasVersion) {
        ctx.addIssue({
          code: 'custom',
          message: 'Meta schema version is required',
          path: ['meta_schema_version'],
        });
      }
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
      engine: z
        .string({ message: 'Engine is required' })
        .min(1, { message: 'Engine is required' }),
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
  // Form-only: the No Transform choice, which the request body sends as a clear.
  transform_ui_config: z
    .object({
      assign: z.enum(['none', 'define_transform']).optional().nullable(),
    })
    .optional()
    .nullable(),
};
export type TransformTabSchemaValues = z.infer<typeof transformTabSchema>;

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

    if (data.receiver_ui_config?.match_mode === 'expression') {
      if (!data.when?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Expression is required',
          path: ['when'],
        });
      }
      return;
    }

    checkMatchNode(data.match, ['match'], ctx);
    if (matchDepth(data.match) > MATCH_NESTING_LIMIT) {
      ctx.addIssue({
        code: 'custom',
        message: `Groups nest at most ${MATCH_NESTING_LIMIT} deep`,
        path: ['match', 'parts'],
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
