import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

const { catalogue } = vi.hoisted(() => ({
  catalogue: vi.fn(),
}));

vi.mock('@/core/hooks/useFetchInfiniteSourceCatalogues', () => ({
  useFetchInfiniteSourceCatalogues: (props: { tags?: string[] }) =>
    catalogue(props),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('AddFromCatalogueTable filters', () => {
  it('asks the catalogue for the tags it was given', () => {
    catalogue.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetchingNextPage: false,
    });

    render(
      <AddFromCatalogueTable
        selectedEntries={[]}
        filters={{ tags: ['aws'] }}
      />,
      {
        wrapper,
      },
    );

    expect(catalogue).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['aws'] }),
    );
    expect(
      screen.getByRole('button', { name: 'Clear 1 Tags' }),
    ).toBeInTheDocument();
  });
});
