'use client';

const getFeatureFlags = (): unknown[] => {
  if (typeof window === 'undefined') return [];
  // Can be replaced with a call to the API in the future
  // Blocked site data throws on the storage read itself, which reads as no flags.
  try {
    const featureFlags = window.localStorage.getItem('featureFlags');
    const parsed: unknown = featureFlags ? JSON.parse(featureFlags) : [];
    // Anything but an array would throw in includes(), or match a flag by substring.
    return Array.isArray(parsed) ? parsed : [];
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
