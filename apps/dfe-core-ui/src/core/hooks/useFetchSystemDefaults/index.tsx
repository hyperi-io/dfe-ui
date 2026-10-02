'use client';

import { useFetchDefaults } from '@/core/hooks/useFetchDefaults';
import { useSystemDefaultsStore } from '@/core/stores/systemDefaultsStore';
import { useEffect } from 'react';
import type { TSystemDefaults } from './types';

const FALLBACK_DEFAULTS = {
  default_ttl_days: 90,
  default_engine: 'MergeTree',
  default_header_type: 'common-header/timeseries',
  default_header_version: '1.0.1',
} as const;

const toDefaults = (defaults: TSystemDefaults): TSystemDefaults => ({
  ...FALLBACK_DEFAULTS,
  ...defaults,
});

export const useFetchSystemDefaults = () => {
  const defaults = useSystemDefaultsStore((state) => state.defaults);
  const setDefaults = useSystemDefaultsStore((state) => state.setDefaults);
  const queryEnabled = defaults == null;

  const { data, isLoading, error } = useFetchDefaults({ queryEnabled });

  useEffect(() => {
    if (!queryEnabled || !data) {
      return;
    }
    setDefaults(
      toDefaults({
        default_ttl_days: data.ttl_days.effective,
        default_engine: data.engine.effective,
        default_header_type: data.common_header_type.effective,
        default_header_version: data.common_header_version.effective,
      }),
    );
  }, [data, queryEnabled, setDefaults]);

  return {
    data: defaults ?? undefined,
    isLoading: queryEnabled && isLoading,
    error: queryEnabled ? error : null,
  };
};
