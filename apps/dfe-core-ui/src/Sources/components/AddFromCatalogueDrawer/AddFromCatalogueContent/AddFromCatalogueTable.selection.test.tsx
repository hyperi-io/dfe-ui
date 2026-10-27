import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddFromCatalogueFormValues } from './AddFromCatalogueForm';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

// jsdom has no IntersectionObserver, and the catalogue list pages on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const selected = (count: number): AddFromCatalogueFormValues[] =>
  Array.from({ length: count }, (_, index) => ({
    entry: `entry-${index}`,
    name: `entry-${index}`,
    intake: 'beats',
    transport: 'bus',
    archive: false,
  }));

describe('AddFromCatalogueTable selection limit', () => {
  it('lets a selection of 50 continue to review', () => {
    render(<AddFromCatalogueTable selectedEntries={selected(50)} />, {
      wrapper,
    });

    expect(
      screen.queryByText('At most 50 entries can be created at once'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Review Catalogues' }),
    ).toBeEnabled();
  });

  it('warns and holds review when more than 50 entries are selected', () => {
    const onUpload = vi.fn();
    render(
      <AddFromCatalogueTable
        selectedEntries={selected(51)}
        onUpload={onUpload}
      />,
      { wrapper },
    );

    expect(
      screen.getByText('At most 50 entries can be created at once'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Review Catalogues' }),
    ).toBeDisabled();
  });
});
