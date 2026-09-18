import { useSystemDefaultsStore } from '@/core/stores/systemDefaultsStore';
import { afterEach, describe, expect, test } from 'vitest';

afterEach(() => {
  useSystemDefaultsStore.getState().reset();
});

describe('useSystemDefaultsStore', () => {
  test('setDefaults writes and reset clears', () => {
    const defaults = {
      default_ttl_days: 90,
      default_engine: 'MergeTree',
      default_header_type: 'common-header/timeseries',
      default_header_version: '1.0.1',
    };

    useSystemDefaultsStore.getState().setDefaults(defaults);
    expect(useSystemDefaultsStore.getState().defaults).toEqual(defaults);

    useSystemDefaultsStore.getState().reset();
    expect(useSystemDefaultsStore.getState().defaults).toBeNull();
  });
});
