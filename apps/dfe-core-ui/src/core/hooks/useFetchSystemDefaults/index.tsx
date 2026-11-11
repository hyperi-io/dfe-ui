'use client';

import { useFetchDefaults } from '@/core/hooks/useFetchDefaults';
import { useSystemDefaultsStore } from '@/core/stores/system/systemDefaultsStore';
import { useEffect } from 'react';

export const useFetchSystemDefaults = () => {
  const defaults = useSystemDefaultsStore((state) => state.defaults);
  const setDefaults = useSystemDefaultsStore((state) => state.setDefaults);
  const queryEnabled = defaults == null;

  const { data, isLoading, error } = useFetchDefaults({ queryEnabled });

  useEffect(() => {
    if (!queryEnabled || !data) {
      return;
    }
    setDefaults({
      default_ttl_days: data.ttl_days.effective,
      default_engine: data.engine.effective,
      default_header_type: data.common_header_type.effective,
      default_header_version: data.common_header_version.effective,
    });
  }, [data, queryEnabled, setDefaults]);

  return {
    data: defaults ?? undefined,
    isLoading: queryEnabled && isLoading,
    error: queryEnabled ? error : null,
  };
};
