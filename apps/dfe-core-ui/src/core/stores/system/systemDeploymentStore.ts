'use client';

import { TSystemDeploymentResponse } from '@/core/hooks/useFetchDeployment/types';
import { create } from 'zustand';

type SystemDeploymentStoreState = {
  deployment: TSystemDeploymentResponse | null;
  setDeployment: (deployment: TSystemDeploymentResponse) => void;
  reset: () => void;
};

const initialState = {
  deployment: null,
} satisfies Omit<SystemDeploymentStoreState, 'setDeployment' | 'reset'>;

export const useSystemDeploymentStore = create<SystemDeploymentStoreState>(
  (set) => ({
    ...initialState,

    setDeployment: (deployment) => {
      set({ deployment });
    },

    reset: () => {
      set({ ...initialState });
    },
  }),
);
