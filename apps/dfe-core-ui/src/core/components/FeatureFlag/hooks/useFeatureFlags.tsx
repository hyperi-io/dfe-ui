'use client';

import { readStorageJson } from '@/core/utils/storage';

// Anything but an array would throw in includes(), or match a flag by substring.
const isList = (value: unknown): value is unknown[] => Array.isArray(value);

// Can be replaced with a call to the API in the future
const getFeatureFlags = (): unknown[] =>
  readStorageJson('featureFlags', isList) ?? [];

export const useFeatureFlags = () => {
  const featureFlags = getFeatureFlags();
  const isFeatureEnabled = (feature: string) => {
    return featureFlags.includes(feature);
  };

  return {
    isFeatureEnabled,
    featureFlags,
  };
};
