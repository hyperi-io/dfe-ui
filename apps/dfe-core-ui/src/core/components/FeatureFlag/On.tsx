import { useContext } from 'react';

import { FeatureFlagContext } from './FeatureFlag';

interface OnProps {
  children: React.ReactNode;
}
export const On = ({ children }: OnProps) => {
  const { isEnabled } = useContext(FeatureFlagContext);

  return isEnabled ? <>{children}</> : null;
};
