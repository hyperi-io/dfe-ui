/** How many widths fit in `available`, starting at `start`. A tag wider than the row still takes the page so paging can move past it. */
export const tagsThatFit = (
  widths: number[],
  available: number,
  gap: number,
  start: number,
): number => {
  if (available <= 0 || widths.length === 0) return 0;

  const from = Math.min(Math.max(start, 0), widths.length - 1);
  let used = 0;
  let count = 0;

  for (let index = from; index < widths.length; index++) {
    const width = widths[index];
    if (width <= 0) return count;
    const next = count === 0 ? width : used + gap + width;
    if (next > available) return Math.max(count, 1);
    used = next;
    count += 1;
  }

  return count;
};

/** Start index of the full page before `start`. */
export const previousTagPageStart = (
  widths: number[],
  available: number,
  gap: number,
  start: number,
): number => {
  if (start <= 0) return 0;

  let pageStart = 0;
  let previous = 0;

  while (pageStart < start) {
    previous = pageStart;
    const count = tagsThatFit(widths, available, gap, pageStart);
    if (count <= 0) return previous;
    const next = pageStart + count;
    if (next <= pageStart) return previous;
    pageStart = next;
  }

  return previous;
};

/** True when the fitted tags leave room and another loaded tag might still fit. */
export const rowHasRoom = (
  widths: number[],
  available: number,
  gap: number,
  start: number,
  count: number,
): boolean => {
  if (count <= 0 || available <= 0) return false;

  let used = 0;
  for (let index = 0; index < count; index++) {
    used += widths[start + index] ?? 0;
    if (index > 0) used += gap;
  }

  return used < available;
};
