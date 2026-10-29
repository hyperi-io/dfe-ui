import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FieldMapSelect, fieldMapLabel, fieldMapPin } from '.';

const useFetchMaps = vi.hoisted(() => vi.fn());
vi.mock('@/core/hooks/useFetchInfiniteFilteredFieldMaps', () => ({
  useFetchInfiniteFilteredFieldMaps: useFetchMaps,
}));

const loadedPage = (items: { standard: string; source: string | null }[]) => ({
  data: { items },
  fetchNextPage: vi.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
});

const { wrapper } = buildTestWrapper().withTheme();

describe('FieldMapSelect selected label', () => {
  it.each([
    {
      name: 'a map on a page not yet fetched',
      value: 'ecs/winlog-own4',
      items: [],
      shown: 'ecs: winlog-own4',
    },
    {
      name: 'a map on the fetched page',
      value: 'ecs/winlog',
      items: [{ standard: 'ecs', source: 'winlog' }],
      shown: 'ecs: winlog',
    },
    {
      name: 'a base map',
      value: 'cim/_default',
      items: [],
      shown: 'cim: _default',
    },
    {
      name: 'a source holding a slash',
      value: 'ecs/a/b',
      items: [],
      shown: 'ecs: a/b',
    },
    {
      name: 'a value that is not a pin',
      value: 'not-a-pin',
      items: [],
      shown: 'not-a-pin',
    },
    { name: 'a value opening on a slash', value: '/x', items: [], shown: '/x' },
  ])('shows $name as "$shown"', ({ value, items, shown }) => {
    useFetchMaps.mockReturnValue(loadedPage(items));
    render(<FieldMapSelect value={value} />, { wrapper });

    expect(screen.getByText(shown)).toBeInTheDocument();
  });

  it('shows the placeholder with nothing selected', () => {
    useFetchMaps.mockReturnValue(loadedPage([]));
    render(<FieldMapSelect />, { wrapper });

    expect(screen.getByText('Select field map')).toBeInTheDocument();
  });
});

describe('FieldMapSelect standard filter', () => {
  it.each([
    { standard: 'ecs', sent: 'ecs' },
    { standard: '', sent: undefined },
    { standard: undefined, sent: undefined },
  ])(
    'asks the engine for standard $sent given $standard',
    ({ standard, sent }) => {
      useFetchMaps.mockReturnValue(loadedPage([]));
      render(<FieldMapSelect standard={standard} />, { wrapper });

      expect(useFetchMaps).toHaveBeenLastCalledWith(
        expect.objectContaining({ standard: sent }),
      );
    },
  );
});

describe('fieldMapPin and fieldMapLabel', () => {
  it.each([
    {
      map: { standard: 'ecs', source: 'winlog' },
      pin: 'ecs/winlog',
      label: 'ecs: winlog',
    },
    {
      map: { standard: 'ecs', source: null },
      pin: 'ecs/_default',
      label: 'ecs: _default',
    },
    {
      map: { standard: 'ocsf' },
      pin: 'ocsf/_default',
      label: 'ocsf: _default',
    },
  ])('$pin reads as $label', ({ map, pin, label }) => {
    expect(fieldMapPin(map)).toBe(pin);
    expect(fieldMapLabel(map)).toBe(label);
  });
});
