import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { SourceUpdateRequestBody } from '@/Sources/hooks/useUpdateSource/types';

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
  const { fetcher, ...rest } = source;
  const transformedSource: SourceUpdateRequestBody = {
    ...rest,
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
