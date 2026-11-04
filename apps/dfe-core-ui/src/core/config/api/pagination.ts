/** The most items the engine returns in one page. A request above it is cut to it. */
export const MAX_PAGE_SIZE = 1000;

type Page<T> = {
  items: T[];
  next_page_token?: string | null;
};

/** The token for the next page, or undefined at the end of the list (`||`, so an empty token stops it too). */
export const getNextPageToken = (
  page: Pick<Page<unknown>, 'next_page_token'>,
) => page.next_page_token || undefined;

/** The engine's `order_by` for a column and direction: `name`, or `name desc`. */
export const toOrderBy = (
  sortBy?: string | null,
  sortOrder?: string | null,
): string | undefined =>
  sortBy ? (sortOrder === 'desc' ? `${sortBy} desc` : sortBy) : undefined;

/** Every item of a list, read page by page until the engine returns no `next_page_token`. */
export async function fetchAllPages<T>(
  fetchPage: (pageToken?: string) => Promise<Page<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let pageToken: string | undefined;
  do {
    const page = await fetchPage(pageToken);
    items.push(...page.items);
    pageToken = getNextPageToken(page);
  } while (pageToken);
  return items;
}
