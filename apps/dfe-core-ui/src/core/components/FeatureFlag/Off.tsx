import { useContext } from 'react';

import { FeatureFlagContext } from './FeatureFlag';

interface OffProps {
  children: React.ReactNode;
}
export const Off = ({ children }: OffProps) => {
  const { isEnabled } = useContext(FeatureFlagContext);

  return !isEnabled ? <>{children}</> : null;
};
