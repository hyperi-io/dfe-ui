'use client';

import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useFeatureFlagStore } from '@/core/stores/system/featureFlagStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchFeatureFlagsApi } from './api';

export const useFetchFeatureFlags = () => {
  const flags = useFeatureFlagStore((state) => state.features);
  const setFeatures = useFeatureFlagStore((state) => state.setFeatures);
  const queryEnabled = flags == null;

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.clientConfig.features(),
    queryFn: () => fetchFeatureFlagsApi(),
  });

  useEffect(() => {
    if (!queryEnabled || !data) {
      return;
    }
    setFeatures(data);
  }, [data, queryEnabled, setFeatures]);

  return {
    data: flags ?? undefined,
    isLoading: queryEnabled && isLoading,
    error: queryEnabled ? error : null,
  };
};
