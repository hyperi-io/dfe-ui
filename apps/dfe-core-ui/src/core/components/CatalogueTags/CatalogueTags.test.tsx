import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CatalogueTags } from '.';

const TAGS = Array.from({ length: 5 }, (_, index) => ({
  id: `tag-${index}`,
  name: `tag-${index}`,
  description: '',
}));

vi.mock('@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags', () => ({
  useFetchInfiniteFilteredSourceCatalogueTags: () => ({
    data: {
      items: TAGS,
      total: TAGS.length,
      page: 1,
      per_page: 50,
      total_pages: 1,
      next_page: null,
      prev_page: null,
    },
    isLoading: false,
    error: null,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();
const nativeGetComputedStyle = window.getComputedStyle.bind(window);

describe('CatalogueTags', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.slot === 'tags' ? 200 : 0;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.dataset.measure === 'tag' ? 80 : 0;
      },
    );
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (
        element instanceof HTMLElement &&
        element.dataset.measureList === 'true'
      ) {
        return { columnGap: '8px' } as CSSStyleDeclaration;
      }
      return nativeGetComputedStyle(element);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pages through the tags that fit in the row', async () => {
    const user = userEvent.setup();
    render(<CatalogueTags />, { wrapper });

    expect(screen.getByRole('button', { name: 'tag-0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tag-1' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'tag-2' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next tags' }));

    expect(
      screen.queryByRole('button', { name: 'tag-0' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tag-2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tag-3' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next tags' }));

    expect(screen.getByRole('button', { name: 'tag-4' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'tag-3' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous tags' }));

    expect(screen.getByRole('button', { name: 'tag-2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tag-3' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'tag-4' }),
    ).not.toBeInTheDocument();
  });
});
