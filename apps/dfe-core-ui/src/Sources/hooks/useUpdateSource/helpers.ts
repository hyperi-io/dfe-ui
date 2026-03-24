import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { SourceUpdateRequestBody } from './types';

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
): SourceUpdateRequestBody => {
  return {
    ...source,
    fetcher:
      Object.keys(source?.fetcher ?? {}).length > 0
        ? {
            ...source?.fetcher,
            auth:
              source?.fetcher?.auth?.type === 'none'
                ? null
                : source?.fetcher?.auth,
          }
        : null,
  };
};
