import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';
import { toApiRootMatch } from '@/Sources/utils/sourceMatch';

import { objectArrayToObject, parseFetcherConfig } from './helpers';

type TRequestMatch = TSourceUpdateRequestBody['match'];

/** The receiver's half of the body: conditions as `match`, or one expression as `when`. */
const receiverRule = (
  source: CreateUpdateSourceFormData,
): { match: TRequestMatch; when?: string } => {
  if (source.receiver_ui_config?.match_mode === 'expression') {
    return { match: null, when: source.when?.trim() ?? '' };
  }
  const match = toApiRootMatch(source.match ?? {});
  // The generated type requires the members the engine defaults and leaves out.
  return { match: match as TRequestMatch };
};

/** Bindings travel only once the source names its own list, and null puts it back on the deployment's. */
const compatBody = (source: CreateUpdateSourceFormData) => {
  const mode = source.receiver_ui_config?.compat_mode;
  if (mode === 'own') {
    return { compat_profiles: source.compat_profiles ?? [] };
  }
  if (mode === 'inherit') {
    return { compat_profiles: null };
  }
  return {};
};

/** Aliases with an empty or untouched profile left out, so only values travel. */
const aliasesBody = (source: CreateUpdateSourceFormData) => {
  if (source.aliases == null) return {};
  const entries = Object.entries(source.aliases).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].length > 0,
  );
  return { aliases: Object.fromEntries(entries) };
};

type TFormSchema = NonNullable<CreateUpdateSourceFormData['schema']>;

/** A blank meta schema or version is left out, since the engine reads one as pinned only when named. */
const schemaBody = (
  schema: TFormSchema,
): TSourceUpdateRequestBody['schema'] => {
  const { meta_schema, meta_schema_version, ...rest } = schema;
  return {
    ...rest,
    // An empty engine is how the API is told to follow the DFE default.
    engine: schema.engine ?? '',
    ...(meta_schema?.trim() ? { meta_schema } : {}),
    ...(meta_schema_version?.trim() ? { meta_schema_version } : {}),
  };
};

type TFormPipeline = NonNullable<CreateUpdateSourceFormData['external']>;

/** The customer's pipeline fields as the engine takes them, blanks left out. */
const pipelineBody = (pipeline: TFormPipeline | null | undefined) => ({
  credential_ref: pipeline?.credential_ref?.trim() || null,
  org: pipeline?.org || null,
  allowed_org_ids: pipeline?.allowed_org_ids ?? [],
  allowed_sources: pipeline?.allowed_sources ?? [],
});

/** The transform the form asks for: a clear, the customer's own pipeline, or a DFE app. */
const transformBody = (
  source: CreateUpdateSourceFormData,
): Pick<TSourceUpdateRequestBody, 'transform'> | Record<string, never> => {
  const { transform, transform_ui_config } = source;
  const assign = transform_ui_config?.assign;
  if (assign === 'none') return { transform: null };
  if (assign === 'external') {
    return { transform: { engine: 'external', ...pipelineBody(transform) } };
  }
  if (transform == null) return {};
  // The pipeline fields belong to an external transform, and the engine refuses them on an app.
  const {
    credential_ref: _ref,
    org: _org,
    allowed_org_ids: _orgs,
    allowed_sources: _sources,
    ...app
  } = transform;
  return { transform: { ...app, env: objectArrayToObject(transform.env) } };
};

/*
 * Transforms the source form data to a request body for the update source API.
 * The selected origin decides which of match, when and fetcher is sent, because
 * the engine refuses a body carrying more than one or none. A field the body
 * leaves out keeps its stored value, so a clear is sent as null.
 *
 * @param source - The source form data to transform
 * @returns The transformed source request body
 */

export const transformSourceFormDataToRequestBody = (
  source: CreateUpdateSourceFormData,
): TSourceUpdateRequestBody => {
  const {
    fetcher,
    match: _match,
    when: _when,
    compat_profiles: _compatProfiles,
    aliases: _aliases,
    origin,
    schema,
    views,
    transform: _transform,
    transform_ui_config: _transformUiConfig,
    external,
    ...rest
  } = source;

  const isFetcherOrigin = origin === 'fetcher';
  const isExternalOrigin = origin === 'external';
  const isReceiverOrigin = !isFetcherOrigin && !isExternalOrigin;

  const parsedConfig = parseFetcherConfig(fetcher?.config);
  const apiFetcher: TSourceUpdateRequestBody['fetcher'] = isFetcherOrigin
    ? {
        source_type: fetcher?.source_type ?? '',
        topic: fetcher?.topic ?? 'own',
        config: parsedConfig.ok ? parsedConfig.config : {},
      }
    : null;

  const apiRule = isReceiverOrigin ? receiverRule(source) : { match: null };

  // Form-only: the table, match and compatibility choices that drive
  // progressive disclosure. The engine never sees them.
  const { receiver_ui_config: _receiverUiConfig, ...apiRest } = rest;

  const transformedSource: TSourceUpdateRequestBody = {
    ...apiRest,
    // An empty engine is how the API is told to follow the DFE default.
    ...(schema != null ? { schema: schemaBody(schema) } : {}),
    ...(views != null
      ? {
          views: views.map((view) => {
            const { custom_mappings, ...viewRest } = view;
            const apiCustomMappings = objectArrayToObject(custom_mappings);
            return {
              ...viewRest,
              ...(apiCustomMappings
                ? { custom_mappings: apiCustomMappings }
                : {}),
            };
          }),
        }
      : {}),
    ...apiRule,
    ...(isReceiverOrigin ? compatBody(source) : {}),
    ...(isReceiverOrigin ? aliasesBody(source) : {}),
    ...transformBody(source),
    fetcher: apiFetcher,
    // The engine reads an absent external as none, so only its own origin sends it.
    ...(isExternalOrigin ? { external: pipelineBody(external) } : {}),
  };
  return transformedSource;
};
