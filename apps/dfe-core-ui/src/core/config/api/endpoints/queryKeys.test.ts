import { describe, expect, it } from 'vitest';
import { QUERY_KEYS } from './queryKeys';

describe('QUERY_KEYS.sources', () => {
  it('keys a search for "enabled" apart from the enabled status filter', () => {
    expect(QUERY_KEYS.sources.default({ search: 'enabled' })).not.toEqual(
      QUERY_KEYS.sources.default({ status: 'enabled' }),
    );
  });

  it.each([
    ['sort_by', { sort_by: 'name' }, { sort_order: 'name' }],
    ['search', { search: 'asc' }, { sort_order: 'asc' }],
    ['status', { status: 'disabled' as const }, { search: 'disabled' }],
  ])('keys %s apart from a different filter with the same value', (_, a, b) => {
    expect(QUERY_KEYS.sources.default(a)).not.toEqual(
      QUERY_KEYS.sources.default(b),
    );
  });

  it('keys the same filters the same way and starts from the sources prefix', () => {
    const filters = { search: 'a', status: 'enabled' as const, per_page: 20 };

    expect(QUERY_KEYS.sources.default(filters)).toEqual(
      QUERY_KEYS.sources.default({ ...filters }),
    );
    expect(QUERY_KEYS.sources.default(filters).slice(0, 1)).toEqual([
      'sources',
    ]);
    expect(QUERY_KEYS.sources.default()).toEqual(['sources']);
  });
});
