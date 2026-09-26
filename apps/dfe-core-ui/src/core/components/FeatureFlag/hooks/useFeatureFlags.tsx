'use client';

const getFeatureFlags = () => {
  if (typeof window === 'undefined') return [];
  // Can be replaced with a call to the API in the future
  // Blocked site data throws on the storage read itself, which reads as no flags.
  try {
    const featureFlags = window.localStorage.getItem('featureFlags');
    return featureFlags ? JSON.parse(featureFlags) : [];
  } catch {
    return [];
  }
};

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
