import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';

import { customMappingsEntriesToRecord } from './customMappingsTransform';

/*
 * Transforms the source form data to a request body for the update source API.
 * If the fetcher is an empty object or not present, it will be set to null.
 * If the fetcher auth type is none, it will be set to null.
 *
 * @param source - The source form data to transform
 * @returns The transformed source request body
 */

export const transformSourceFormDataToRequestBody = (
  source: CreateUpdateSourceFormData,
): TSourceUpdateRequestBody => {
  const { fetcher, match, views, ...rest } = source;

  let apiMatch: TSourceUpdateRequestBody['match'] | undefined;
  if (match) {
    const { operator: _operator, field, value } = match;
    apiMatch = { field, operator: _operator ?? 'equals', value: value ?? '' };
  }

  const transformedSource: TSourceUpdateRequestBody = {
    ...rest,
    ...(views != null
      ? {
          views: views.map((view) => {
            const { custom_mappings, ...viewRest } = view;
            const apiCustomMappings =
              customMappingsEntriesToRecord(custom_mappings);
            return {
              ...viewRest,
              ...(apiCustomMappings
                ? { custom_mappings: apiCustomMappings }
                : {}),
            };
          }),
        }
      : {}),
    ...(apiMatch
      ? { match: apiMatch }
      : { match: { field: '', operator: 'equals', value: '' } }),
    fetcher:
      Object.keys(fetcher ?? {}).length > 0
        ? {
            ...fetcher,
            auth: fetcher?.auth?.type === 'none' ? null : fetcher?.auth,
            source_type: fetcher?.source_type ?? '',
            poll_interval_secs: fetcher?.poll_interval_secs ?? 0,
          }
        : null,
  };
  return transformedSource;
};
