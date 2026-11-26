import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { cn } from '@/core/utils/style';
import { Button, Spin } from 'antd';
import { useEffect, useRef, type ReactNode } from 'react';

const LINK_CLASS =
  'text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary';

/**
 * A list with "Show more" centred under it. Pressed, the list scrolls in its own box and loads the next page as its end comes into view, so a list below it stays in reach.
 */
export const PagedList = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  onShowMore,
  scrolling,
}: {
  children: ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  onShowMore: () => void;
  scrolling: boolean;
}) => {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = marker.current;
    if (!scrolling || !hasMore || !node) return;
    // Observed afresh after each render, so a page too short to scroll loads the next one too.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  });

  return (
    <>
      {/* The same box before and after, its scrollbar's room kept, so the list never shifts when it starts scrolling. */}
      <CustomScrollbar
        className={cn('[scrollbar-gutter:stable]', scrolling && 'max-h-[60vh]')}
      >
        {children}
        {scrolling && (
          <div ref={marker} className="flex h-8 items-center justify-center">
            {loading && <Spin size="small" />}
          </div>
        )}
      </CustomScrollbar>
      {!scrolling && hasMore && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            type="link"
            className={LINK_CLASS}
            disabled={loading}
            onClick={onShowMore}
          >
            Show more
          </Button>
          {loading && <Spin size="small" />}
        </div>
      )}
    </>
  );
};
