import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSchemaVocabularyApi } from './api';

/**
 * The primitives, use cases, attributes and override types the engine accepts
 * for a column. The engine reads them from the dfe-schemas it runs, so the
 * console offers nothing the engine would refuse.
 */
export const useFetchSchemaVocabulary = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.schemas.vocabulary(),
    queryFn: () => fetchSchemaVocabularyApi(),
    // Fixed for the life of a deployment: it changes only with the engine image.
    staleTime: Infinity,
  });

  return { data, isLoading, error };
};
