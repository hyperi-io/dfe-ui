import { createContext, useMemo } from 'react';
import { useFeatureFlags } from './hooks/useFeatureFlags';

interface FeatureFlagProps {
  children: React.ReactNode;
  feature: string;
}

export const FeatureFlagContext = createContext<{
  isEnabled: boolean;
}>({
  isEnabled: false,
});

export const FeatureFlag = ({ children, feature }: FeatureFlagProps) => {
  const { isFeatureEnabled } = useFeatureFlags();
  const isEnabled = isFeatureEnabled(feature);

  const value = useMemo(
    () => ({
      isEnabled,
    }),
    [isEnabled],
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
