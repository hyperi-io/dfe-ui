import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useHuntRunState } from '.';

const list = vi.hoisted(() => ({
  items: [] as Array<{
    name: string;
    auto_disabled_at?: number | null;
    auto_disabled_reason?: string | null;
  }>,
}));
vi.mock('@/Hunts/contexts/ListHuntsContext', () => ({
  useListHuntsContext: () => ({ data: { items: list.items } }),
}));

afterEach(() => {
  list.items = [];
});

const hunt: THuntDetailResponse = {
  name: 'windows_audit',
  display_name: 'Windows audit',
  auto_disabled_reason: '',
  error: '',
  cron: '*/5 * * * *',
  log_buffer: 60,
  global_source_table_name: 'windows_audit',
  customers: ['acme'],
  rules: [{ rule_name: 'brute_force' }],
  enabled: true,
};

// An engine that predates the stop on the detail leaves the field out.
const olderEngine = { auto_disabled_at: undefined };

describe('useHuntRunState', () => {
  it.each([
    {
      case: 'the detail carries the stop and the list holds no matching item',
      detail: { auto_disabled_at: 1_763_300_000, auto_disabled_reason: 'r:1' },
      items: [],
      expected: { autoDisabledAt: 1_763_300_000, autoDisabledReason: 'r:1' },
    },
    {
      case: 'the detail carries the stop and the list row disagrees',
      detail: { auto_disabled_at: 1_763_300_000, auto_disabled_reason: 'r:1' },
      items: [
        {
          name: 'windows_audit',
          auto_disabled_at: 1_700_000_000,
          auto_disabled_reason: 'old',
          error: '',
        },
      ],
      expected: { autoDisabledAt: 1_763_300_000, autoDisabledReason: 'r:1' },
    },
    {
      case: 'the detail says no stop and the list row is stale',
      detail: { auto_disabled_at: null, auto_disabled_reason: '' },
      items: [
        {
          name: 'windows_audit',
          auto_disabled_at: 1_700_000_000,
          auto_disabled_reason: 'old',
          error: '',
        },
      ],
      expected: { autoDisabledAt: null, autoDisabledReason: '' },
    },
    {
      case: 'the detail omits the fields and the list row has the stop',
      detail: olderEngine,
      items: [
        {
          name: 'windows_audit',
          auto_disabled_at: 1_763_300_000,
          auto_disabled_reason: 'r:1',
          error: '',
        },
      ],
      expected: { autoDisabledAt: 1_763_300_000, autoDisabledReason: 'r:1' },
    },
    {
      case: 'the detail omits the fields and only another hunt is listed',
      detail: olderEngine,
      items: [{ name: 'other', auto_disabled_at: 1_763_300_000 }],
      expected: {
        autoDisabledAt: undefined,
        autoDisabledReason: undefined,
      },
    },
  ])('with $case', ({ detail, items, expected }) => {
    list.items = items;

    const { result } = renderHook(() =>
      useHuntRunState({ ...hunt, ...detail }),
    );

    expect(result.current).toEqual({ enabled: true, ...expected });
  });
});
