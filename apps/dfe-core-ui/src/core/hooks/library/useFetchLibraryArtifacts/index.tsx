import { useQuery } from '@tanstack/react-query';
import { fetchLibraryArtifactsApi } from './api';
import { TLibraryArtifactFilters } from './types';

export const LIBRARY_ARTIFACTS_QUERY_KEY = ({
  kind,
  group,
  state,
  label,
  q,
}: TLibraryArtifactFilters = {}) => [
  'library-artifacts',
  ...(kind ? [kind] : []),
  ...(group ? [group] : []),
  ...(state ? [state] : []),
  ...(label?.length ? [label.join(',')] : []),
  ...(q ? [q] : []),
];

/**
 * The artefact library, filtered by label-style metadata.
 *
 * Labels classify and are editable without publishing; tags point at versions.
 * Only the first is a filter here - that is the finding story.
 */
export const useFetchLibraryArtifacts = ({
  filters = {},
  queryEnabled = true,
}: {
  filters?: TLibraryArtifactFilters;
  queryEnabled?: boolean;
} = {}) => {
  const { kind, group, state, label, q } = filters;
  const { data, isLoading, error } = useQuery({
    queryKey: LIBRARY_ARTIFACTS_QUERY_KEY(filters),
    queryFn: () =>
      fetchLibraryArtifactsApi({
        queryParams: {
          ...(kind ? { kind } : {}),
          ...(group ? { group } : {}),
          ...(state ? { state } : {}),
          ...(label?.length ? { label } : {}),
          ...(q ? { q } : {}),
        },
      }),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
