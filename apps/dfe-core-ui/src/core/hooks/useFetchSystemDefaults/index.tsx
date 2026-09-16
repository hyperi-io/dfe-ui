'use client';

import { useFetchSystemSettings } from '@/core/hooks/useFetchSystemSettings';
import { useSystemDefaultsStore } from '@/core/stores/systemDefaultsStore';
import { useEffect } from 'react';
import type { TSystemDefaults } from './types';

const FALLBACK_DEFAULTS = {
  default_engine: 'MergeTree',
  default_header_type: 'common-header/timeseries.yml',
  default_header_version: '1.0.1',
} as const;

const toDefaults = (
  clickhouseDefaultTtlDays: number | undefined,
): TSystemDefaults => ({
  default_ttl_days: clickhouseDefaultTtlDays,
  ...FALLBACK_DEFAULTS,
});

export const useFetchSystemDefaults = () => {
  const defaults = useSystemDefaultsStore((state) => state.defaults);
  const setDefaults = useSystemDefaultsStore((state) => state.setDefaults);
  const queryEnabled = defaults == null;

  const { data, isLoading, error } = useFetchSystemSettings({ queryEnabled });

  useEffect(() => {
    if (!queryEnabled || !data) {
      return;
    }
    setDefaults(toDefaults(data.clickhouse_default_ttl_days));
  }, [data, queryEnabled, setDefaults]);

  return {
    data: defaults ?? undefined,
    isLoading: queryEnabled && isLoading,
    error: queryEnabled ? error : null,
  };
};
