import { useState } from 'react';

/** How many items a list shows before "Show more". */
export const SHOW_STEP = 6;

/** The page a list loads as it scrolls, once "Show more" is pressed. */
export const SCROLL_PAGE_SIZE = 24;

/** The engine's largest page, for a list read whole in one request. */
export const SHOW_ALL_PAGE_SIZE = 1000;

/**
 * Paging for a list that shows *step* items, then on "Show more" loads the rest as it scrolls.
 *
 * *hidden* counts items the caller drops from each page, so a page still fills the list.
 */
export const useShowMore = ({
  hidden = 0,
  step = SHOW_STEP,
}: { hidden?: number; step?: number } = {}) => {
  const [scrolling, setScrolling] = useState(false);

  const view = <T>({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items,
  }: {
    fetchNextPage: () => Promise<unknown>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    items: readonly T[];
  }) => {
    const limit = scrolling ? items.length : step;
    return {
      hasMore: items.length > limit || hasNextPage,
      loadMore: () => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      },
      visible: items.slice(0, limit),
    };
  };

  return {
    pageSize: (scrolling ? SCROLL_PAGE_SIZE : step) + hidden,
    reset: () => setScrolling(false),
    scrolling,
    showMore: () => setScrolling(true),
    view,
  };
};
