import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';

/*
 * Transforms the source request body to a form data object.
 * If the fetcher auth type is none, it will be set to null.
 *
 * @param source - The source request body to transform
 * @returns The transformed form data object
 */
export const transformSourceRequestBodyToFormData = (
  source?: TSourceVersionDetail,
): CreateUpdateSourceFormData => {
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
          config_file: source?.version?.transform?.config_file ?? null,
        }
      : undefined,
    // If the fetcher is present it transforms the auth type to none if it is null
    fetcher:
      Object.keys(source?.version?.fetcher ?? {}).length > 0
        ? {
            ...source?.version?.fetcher,
            base_url: source?.version?.fetcher?.base_url ?? '',
            poll_interval_secs:
              source?.version?.fetcher?.poll_interval_secs ?? 0,
            auth: {
              ...source?.version?.fetcher?.auth,
              type: source?.version?.fetcher?.auth
                ? source?.version?.fetcher?.auth?.type
                : 'none',
            },
          }
        : null,
    match: source?.version?.match
      ? { ...source.version.match }
      : { field: '', value: '' },
  };
  return transformedSource;
};
