'use client';

import { TFeatureFlagsResponse } from '@/core/hooks/useFetchFeatureFlags/types';
import { create } from 'zustand';

type FeatureFlagStoreState = {
  features: TFeatureFlagsResponse | null;
  setFeatures: (features: TFeatureFlagsResponse) => void;
  reset: () => void;
};

const initialState = {
  features: null,
} satisfies Omit<FeatureFlagStoreState, 'setFeatures' | 'reset'>;

export const useFeatureFlagStore = create<FeatureFlagStoreState>((set) => ({
  ...initialState,

  setFeatures: (features) => {
    set({ features });
  },

  reset: () => {
    set({ ...initialState });
  },
}));
