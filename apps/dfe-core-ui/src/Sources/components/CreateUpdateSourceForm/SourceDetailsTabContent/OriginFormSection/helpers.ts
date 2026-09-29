import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { TAppsResponse } from '@/core/hooks/apps/instances/useFetchApps/types';

export const EMPTY_MATCH: NonNullable<CreateUpdateSourceFormData['match']> = {
  field: '',
  operator: 'equals',
  value: '',
};

export const EMPTY_FETCHER: NonNullable<CreateUpdateSourceFormData['fetcher']> =
  {
    source_type: '',
    config: '',
  };

/**
 * The fetcher families the deployed stack accepts.
 *
 * The manifest names them, so this reads whichever app declares source_types
 * rather than knowing an app by name.
 */
export const getFetcherSourceTypes = (apps?: TAppsResponse): string[] =>
  [...new Set((apps ?? []).flatMap((app) => app.source_types ?? []))].sort();
