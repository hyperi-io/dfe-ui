import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

import { objectToObjectArray, stringifyFetcherConfig } from './helpers';

/*
 * Transforms the source request body to a form data object.
 * A version carrying a fetcher is fetcher-based; anything else is receiver-based.
 *
 * @param source - The source request body to transform
 * @returns The transformed form data object
 */
export const transformSourceRequestBodyToFormData = (
  source?: TSourceVersionDetail,
): CreateUpdateSourceFormData => {
  const fetcher = source?.version?.fetcher;
  const hasFetcher = Object.keys(fetcher ?? {}).length > 0;

  const transformedSource: CreateUpdateSourceFormData = {
    ...source,
    source: source?.source ?? '',
    enabled: source?.enabled ?? false,
    ...source?.version,
    header: source?.version?.header
      ? {
          ...source?.version?.header,
          type: source?.version?.header?.type ?? '',
          version: source?.version?.header?.version ?? '',
        }
      : undefined,
    // Manual cast because schema form rules are stricter than the source request body
    schema: source?.version?.schema
      ? {
          ...source?.version?.schema,
          meta_schema: source?.version?.schema?.meta_schema ?? '',
          meta_schema_version:
            source?.version?.schema?.meta_schema_version ?? '',
        }
      : undefined,
    // Manual cast because transform form rules are stricter than the source request body
    transform: source?.version?.transform
      ? {
          ...source?.version?.transform,
          env: objectToObjectArray(source?.version?.transform?.env),
          config_file: source?.version?.transform?.config_file ?? null,
        }
      : undefined,
    origin: hasFetcher ? 'fetcher' : 'receiver',
    fetcher: hasFetcher
      ? {
          source_type: fetcher?.source_type ?? '',
          topic: fetcher?.topic ?? 'own',
          config: stringifyFetcherConfig(fetcher?.config),
        }
      : null,
    match: source?.version?.match
      ? { ...source.version.match }
      : { field: '', value: '' },
    views: source?.version?.views?.map((view) => {
      const { custom_mappings, ...viewRest } = view;
      const formCustomMappings = objectToObjectArray(custom_mappings);
      return {
        ...viewRest,
        ...(formCustomMappings ? { custom_mappings: formCustomMappings } : {}),
      };
    }),
  };
  return transformedSource;
};
