const getFeatureFlags = () => {
  // Can be replaced with a call to the API in the future
  const featureFlags = window.localStorage.getItem('featureFlags');
  if (!featureFlags) return [];

  try {
    return JSON.parse(featureFlags);
  } catch (_error) {
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
