/* import-scope-drift-disable - (persist feature for future use) */
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { FeatureFlagProps } from './FeatureFlag';
import { Off } from './Off';
import { On } from './On';

export * from './hooks/useFeatureFlags';

const FeatureFlagRoot = dynamic(
  () => import('./FeatureFlag').then((mod) => mod.FeatureFlag),
  { ssr: false },
) as ComponentType<FeatureFlagProps>;

type FeatureFlagCompound = ComponentType<FeatureFlagProps> & {
  On: typeof On;
  Off: typeof Off;
};

export const FeatureFlag: FeatureFlagCompound = Object.assign(FeatureFlagRoot, {
  On,
  Off,
});

export { Off, On };
/* import-scope-drift-enable */
