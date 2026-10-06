import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';

import { objectArrayToObject, parseFetcherConfig } from './helpers';

/*
 * Transforms the source form data to a request body for the update source API.
 * The selected origin decides which of match and fetcher is sent; the engine
 * refuses a body carrying both or neither.
 *
 * @param source - The source form data to transform
 * @returns The transformed source request body
 */

export const transformSourceFormDataToRequestBody = (
  source: CreateUpdateSourceFormData,
): TSourceUpdateRequestBody => {
  const { fetcher, match, origin, schema, views, transform, ...rest } = source;

  const isFetcherOrigin = origin === 'fetcher';

  const parsedConfig = parseFetcherConfig(fetcher?.config);
  const apiFetcher: TSourceUpdateRequestBody['fetcher'] = isFetcherOrigin
    ? {
        source_type: fetcher?.source_type ?? '',
        topic: fetcher?.topic ?? 'own',
        config: parsedConfig.ok ? parsedConfig.config : {},
      }
    : null;

  const apiMatch: TSourceUpdateRequestBody['match'] = isFetcherOrigin
    ? null
    : {
        field: match?.field ?? '',
        operator: match?.operator ?? 'equals',
        value: match?.value ?? '',
      };

  // Form-only: which table choice drives progressive disclosure. The engine
  // never sees it.
  const { receiver_ui_config: _receiverUiConfig, ...apiRest } = rest;

  const transformedSource: TSourceUpdateRequestBody = {
    ...apiRest,
    // An empty engine is how the API is told to follow the DFE default.
    ...(schema != null
      ? { schema: { ...schema, engine: schema.engine ?? '' } }
      : {}),
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
    match: apiMatch,
    ...(transform != null
      ? { transform: { ...transform, env: objectArrayToObject(transform.env) } }
      : {}),
    fetcher: apiFetcher,
  };
  return transformedSource;
};
