import { TInfiniteFilteredSourceCatalogueTagsResponse } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags/types';
import { IconChevronLeft, IconChevronRight } from '@repo/dfe-icons';
import { cn } from '@repo/dfe-shared-ui';
import { Button } from 'antd';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  previousTagPageStart,
  rowHasRoom,
  tagsThatFit,
} from './fitTags.helper';

type TagMetrics = {
  widths: number[];
  available: number;
  gap: number;
};

const EMPTY_METRICS: TagMetrics = { widths: [], available: 0, gap: 0 };

export const PaginatedTagsList = ({
  items = [],
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage = () => {},
  onChange,
  selectedTags,
}: {
  items: TInfiniteFilteredSourceCatalogueTagsResponse['items'];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onChange?: (tagId: string) => void;
  selectedTags: Set<string>;
}) => {
  const [start, setStart] = useState(0);
  const [metrics, setMetrics] = useState<TagMetrics>(EMPTY_METRICS);
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLUListElement>(null);
  const pendingNext = useRef(false);

  const pageStart = items.length === 0 ? 0 : Math.min(start, items.length - 1);
  const measured = metrics.widths.length === items.length && items.length > 0;
  const count = measured
    ? tagsThatFit(metrics.widths, metrics.available, metrics.gap, pageStart)
    : 0;
  const visibleItems = items.slice(pageStart, pageStart + count);
  const canGoBack = measured && pageStart > 0;
  const canGoForward =
    measured && (pageStart + count < items.length || Boolean(hasNextPage));
  const loneTagOverflows =
    visibleItems.length === 1 &&
    (metrics.widths[pageStart] ?? 0) > metrics.available;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const measure = measureRef.current;
    if (!viewport || !measure) return;

    const measureNow = () => {
      const available = viewport.clientWidth;
      const gapValue = Number.parseFloat(getComputedStyle(measure).columnGap);
      const gap = Number.isFinite(gapValue) ? gapValue : 0;
      const widths = Array.from(measure.children, (child) =>
        child instanceof HTMLElement ? child.offsetWidth : 0,
      );

      setMetrics((current) => {
        if (
          current.available === available &&
          current.gap === gap &&
          current.widths.length === widths.length &&
          current.widths.every((width, index) => width === widths[index])
        ) {
          return current;
        }
        return { available, gap, widths };
      });
    };

    measureNow();
    const observer = new ResizeObserver(measureNow);
    observer.observe(viewport);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!measured || isFetchingNextPage || !hasNextPage) return;
    if (pageStart + count < items.length) return;
    if (
      !rowHasRoom(
        metrics.widths,
        metrics.available,
        metrics.gap,
        pageStart,
        count,
      )
    ) {
      return;
    }
    void fetchNextPage();
  }, [
    measured,
    isFetchingNextPage,
    hasNextPage,
    pageStart,
    count,
    items.length,
    metrics,
    fetchNextPage,
  ]);

  useEffect(() => {
    if (!pendingNext.current || isFetchingNextPage) return;
    if (metrics.widths.length !== items.length) return;
    pendingNext.current = false;
    queueMicrotask(() =>
      setStart((current) => {
        const fitted = tagsThatFit(
          metrics.widths,
          metrics.available,
          metrics.gap,
          current,
        );
        const next = current + fitted;
        return next < items.length ? next : current;
      }),
    );
  }, [isFetchingNextPage, items.length, metrics]);

  const goBack = () => {
    setStart(
      previousTagPageStart(
        metrics.widths,
        metrics.available,
        metrics.gap,
        pageStart,
      ),
    );
  };

  const goForward = () => {
    const next = pageStart + count;
    if (next < items.length) {
      setStart(next);
      return;
    }
    if (hasNextPage && !isFetchingNextPage) {
      pendingNext.current = true;
      void fetchNextPage();
    }
  };

  return (
    <>
      <Button
        className="shrink-0"
        size="small"
        type="text"
        aria-label="Previous tags"
        icon={<IconChevronLeft />}
        disabled={!canGoBack}
        onClick={goBack}
      />
      <div
        ref={viewportRef}
        data-slot="tags"
        className="relative min-w-0 flex-1 overflow-hidden"
      >
        <ul className="flex gap-2" aria-label="Catalogue tags">
          {visibleItems.map((item) => (
            <li
              key={item.id}
              className={cn(
                'shrink-0',
                loneTagOverflows && 'min-w-0 max-w-full shrink',
              )}
            >
              <Button
                onClick={() => onChange?.(item.id)}
                size="small"
                className={cn(
                  'max-w-full',
                  loneTagOverflows && 'min-w-0',
                  selectedTags.has(item.id) &&
                    'bg-tertiary/50 text-foreground-muted dark:text-dark-foreground',
                )}
              >
                <span className={cn(loneTagOverflows && 'block truncate')}>
                  {item.name}
                </span>
              </Button>
            </li>
          ))}
        </ul>
        <ul
          ref={measureRef}
          data-measure-list="true"
          aria-hidden
          className="pointer-events-none invisible absolute top-0 left-0 flex w-max gap-2"
        >
          {items.map((item) => (
            <li key={item.id} data-measure="tag">
              <Button size="small" tabIndex={-1}>
                {item.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <Button
        className="shrink-0"
        size="small"
        type="text"
        aria-label="Next tags"
        icon={<IconChevronRight />}
        disabled={!canGoForward}
        loading={isFetchingNextPage}
        onClick={goForward}
      />
    </>
  );
};
