'use client';

import { useFetchFeatureFlags } from '@/core/hooks/useFetchFeatureFlags';
import { readStorageJson } from '@/core/utils/storage';
import { useMemo } from 'react';

// Anything but an array would throw in includes(), or match a flag by substring.
const isList = (value: unknown): value is unknown[] => Array.isArray(value);

const getFeatureFlags = (): unknown[] =>
  readStorageJson('featureFlags', isList) ?? [];

export const useFeatureFlags = () => {
  const featureFlagsJsonStorage = getFeatureFlags();
  const { data: featureFlagsResponse } = useFetchFeatureFlags();

  const enabledApiFeatures = useMemo(() => {
    return Object.entries(featureFlagsResponse ?? {})
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  }, [featureFlagsResponse]);

  const featureFlags = [...featureFlagsJsonStorage, ...enabledApiFeatures];

  const isFeatureEnabled = (feature: string) => {
    return featureFlags.includes(feature);
  };

  return {
    isFeatureEnabled,
    featureFlags,
  };
};
