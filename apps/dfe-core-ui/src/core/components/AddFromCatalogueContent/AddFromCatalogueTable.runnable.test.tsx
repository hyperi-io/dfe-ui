import { TSourceCatalogueItem } from '@/core/hooks/useFetchInfiniteSourceCatalogues/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

const { catalogue } = vi.hoisted(() => ({ catalogue: vi.fn() }));

vi.mock('@/core/hooks/useFetchInfiniteSourceCatalogues', () => ({
  useFetchInfiniteSourceCatalogues: () => catalogue(),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const REASON = 'needs a per-source app, which a gRPC deployment does not run';

const entry = (name: string, runnable: boolean): TSourceCatalogueItem => ({
  name,
  package: 'pkg',
  data_stream: 'stream',
  dataset: 'dataset',
  intakes: ['beats'],
  default_intake: 'beats',
  has_schema: true,
  variants: [],
  availability: 'available',
  availability_reason: '',
  runnable,
  runnable_reason: runnable ? '' : REASON,
  runnable_intakes: runnable ? ['beats'] : [],
});

const listed = (items: TSourceCatalogueItem[]) =>
  catalogue.mockReturnValue({
    data: { items, total_size: items.length },
    isLoading: false,
    isFetchingNextPage: false,
  });

describe('AddFromCatalogueTable runnable', () => {
  beforeEach(() => catalogue.mockReset());

  it('disables an entry the engine cannot run and says why on hover', async () => {
    listed([entry('can-run', true), entry('cannot-run', false)]);
    render(<AddFromCatalogueTable selectedEntries={[]} />, { wrapper });

    expect(screen.getByLabelText('Select row 1')).toBeEnabled();
    expect(screen.getByLabelText('Select row 2')).toBeDisabled();
    await userEvent.setup().hover(screen.getByText('cannot-run'));
    expect(await screen.findByText(REASON)).toBeInTheDocument();
    expect(
      screen.queryByText('This deployment cannot run any of these entries'),
    ).not.toBeInTheDocument();
  });

  it('says so once when nothing listed can run', () => {
    listed([entry('a', false), entry('b', false)]);
    render(<AddFromCatalogueTable selectedEntries={[]} />, { wrapper });

    expect(
      screen.getByText('This deployment cannot run any of these entries'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Select row 1')).toBeDisabled();
    expect(screen.getByLabelText('Select row 2')).toBeDisabled();
  });
});
