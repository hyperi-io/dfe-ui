import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { SourceDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

/*
 * Transforms the source request body to a form data object.
 * If the fetcher auth type is none, it will be set to null.
 *
 * @param source - The source request body to transform
 * @returns The transformed form data object
 */
export const transformSourceRequestBodyToFormData = (
  source?: SourceDetail,
): CreateUpdateSourceFormData => {
  const transformedSource: CreateUpdateSourceFormData = {
    ...source,
    source: source?.source ?? '',
    enabled: source?.enabled ?? false,
    // Manual cast because schema form rules are stricter than the source request body
    schema: source?.schema
      ? {
          ...source?.schema,
          meta_schema: source?.schema?.meta_schema ?? '',
          meta_schema_version: source?.schema?.meta_schema_version ?? '',
        }
      : undefined,
    // Manual cast because transform form rules are stricter than the source request body
    transform: source?.transform
      ? {
          ...source?.transform,
          config_file: source?.transform?.config_file ?? null,
        }
      : undefined,
    fetcher: {
      ...source?.fetcher,
      base_url: source?.fetcher?.base_url ?? '',
      poll_interval_secs: source?.fetcher?.poll_interval_secs ?? 0,
      auth: {
        ...source?.fetcher?.auth,
        type: source?.fetcher?.auth ? source?.fetcher?.auth?.type : 'none',
      },
    },
  };
  return transformedSource;
};
