import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TSourceCatalogueItem } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AddFromCatalogueFormValues } from './AddFromCatalogueForm';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

vi.mock('@/Sources/hooks/useFetchInfiniteSourceCatalogues', () => ({
  useFetchInfiniteSourceCatalogues: ({
    page = 1,
    per_page = 50,
  }: {
    page?: number;
    per_page?: number;
  } = {}) => ({
    data: {
      items: Array.from({ length: per_page }, (_, index) =>
        catalogueItem((page - 1) * per_page + index),
      ),
      total: 1064,
    },
    isLoading: false,
    isFetchingNextPage: false,
  }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const catalogueItem = (index: number): TSourceCatalogueItem => ({
  name: `entry-${index}`,
  package: 'pkg',
  data_stream: 'stream',
  dataset: 'dataset',
  intakes: ['beats'],
  default_intake: 'beats',
  has_schema: true,
  variants: [],
  availability: 'available',
  availability_reason: '',
});

const Harness = () => {
  const [selectedEntries, setSelectedEntries] = useState<
    AddFromCatalogueFormValues[]
  >([]);
  return (
    <AddFromCatalogueTable
      selectedEntries={selectedEntries}
      onSelectedEntriesChange={setSelectedEntries}
    />
  );
};

describe('AddFromCatalogueTable pagination', () => {
  it('shows the requested page while entries stay selected', async () => {
    const user = userEvent.setup();
    render(<Harness />, { wrapper });

    expect(screen.getByText('entry-0')).toBeInTheDocument();
    expect(screen.getByText('10 of 1064 entries shown')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(screen.getByText(/1 entries selected/)).toBeInTheDocument();

    await user.click(
      screen.getByText('3', { selector: '.ant-pagination-item a' }),
    );

    expect(screen.getByText('entry-20')).toBeInTheDocument();
    expect(screen.getByText('entry-29')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'No catalogue is mounted on this deployment, or nothing matches the filter.',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/1 entries selected/)).toBeInTheDocument();
  });
});
