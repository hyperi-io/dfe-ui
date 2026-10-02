import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommonHeaderSelect } from '.';

vi.mock('@/core/hooks/useFetchInfiniteFilteredSchemas', () => ({
  useFetchInfiniteFilteredSchemas: () => ({
    data: {
      items: [
        {
          name: 'common-header/timeseries',
          resource_type: 'core',
          current: '1.0.1',
          versions: ['1.0.1'],
          updated_at: '',
          column_count: 0,
        },
      ],
    },
    isLoading: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

describe('CommonHeaderSelect', () => {
  it('shows a header type that arrives after mount', () => {
    const { rerender } = render(<CommonHeaderSelect />);

    expect(screen.getByText('Select common header')).toBeInTheDocument();

    rerender(<CommonHeaderSelect value="common-header/timeseries" />);

    expect(screen.getByText('timeseries')).toBeInTheDocument();
  });
});
