import { CollapsibleSearchInput } from '@/core/components/CollapsibleSearchInput';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchInfiniteFilteredSourceCatalogueTags } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags';
import { TInfiniteFilteredSourceCatalogueTagsResponse } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags/types';
import { Button, Spin } from 'antd';
import { useRef, useState } from 'react';
import { PaginatedTagsList } from './PaginatedTagsList';

const TAGS_PER_REQUEST = 50;
const NO_TAGS: TInfiniteFilteredSourceCatalogueTagsResponse['items'] = [];

export const CatalogueTags = ({
  onChange,
}: {
  onChange?: (tags: string[]) => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const pendingNext = useRef(false);
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSourceCatalogueTags({
    name: search,
    per_page: TAGS_PER_REQUEST,
  });

  const items = data?.items ?? NO_TAGS;

  const handleTagClick = (tagId: string) => {
    const next = new Set(selectedTags);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    setSelectedTags(next);
    onChange?.(Array.from(next));
  };

  return (
    <div className="flex min-h-[32px] w-full min-w-0 items-center gap-2 overflow-x-hidden">
      <CollapsibleSearchInput
        placeholder="Search tags"
        className="w-96"
        value={search}
        onChange={(event) => {
          pendingNext.current = false;
          setSearch(event.target.value);
        }}
        allowClear
      />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isLoading && items.length === 0 ? (
          <span className="flex w-full items-center justify-center gap-2">
            <Spin /> <span className="sr-only">Loading...</span>
          </span>
        ) : error ? (
          <NotificationCard
            type="error"
            title="Error loading tags"
            description={error.message}
          />
        ) : items.length === 0 ? (
          <NotificationCard title="No tags found" />
        ) : (
          <PaginatedTagsList
            items={items}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            onChange={handleTagClick}
            selectedTags={selectedTags}
          />
        )}
      </div>
      {selectedTags.size > 0 && (
        <Button
          onClick={() => setSelectedTags(new Set())}
          size="small"
          type="text"
          className="shrink-0"
          disabled={selectedTags.size === 0}
        >
          Clear {selectedTags.size} Tags
        </Button>
      )}
    </div>
  );
};
