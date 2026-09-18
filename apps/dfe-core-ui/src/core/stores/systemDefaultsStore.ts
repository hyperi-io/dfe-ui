'use client';

import type { TSystemDefaults } from '@/core/hooks/useFetchSystemDefaults/types';
import { create } from 'zustand';

type SystemDefaultsStoreState = {
  defaults: TSystemDefaults | null;
  setDefaults: (defaults: TSystemDefaults) => void;
  reset: () => void;
};

const initialState = {
  defaults: null,
} satisfies Omit<SystemDefaultsStoreState, 'setDefaults' | 'reset'>;

export const useSystemDefaultsStore = create<SystemDefaultsStoreState>(
  (set) => ({
    ...initialState,

    setDefaults: (defaults) => {
      set({ defaults });
    },

    reset: () => {
      set({ ...initialState });
    },
  }),
);
