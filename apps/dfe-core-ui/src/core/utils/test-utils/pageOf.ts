/**
 * One page of `all`, cut the way the engine cuts it: `page_size` items (10
 * when absent) after `skip`, from the offset a `page_token` carries. The token
 * is the next offset, and the last page answers `null`.
 */
export function pageOf<T>(
  all: T[],
  request: Request,
  extra: Partial<Record<string, unknown>> = {},
) {
  const { searchParams } = new URL(request.url);
  const pageSize = Number(searchParams.get('page_size')) || 10;
  const start =
    Number(searchParams.get('page_token') ?? 0) +
    Number(searchParams.get('skip') ?? 0);
  const end = start + pageSize;
  return {
    items: all.slice(start, end),
    next_page_token: end < all.length ? String(end) : null,
    total_size: all.length,
    ...extra,
  };
}
