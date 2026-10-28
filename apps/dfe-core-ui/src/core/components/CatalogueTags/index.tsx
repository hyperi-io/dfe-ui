import { CollapsibleSearchInput } from '@/core/components/CollapsibleSearchInput';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchInfiniteFilteredSourceCatalogueTags } from '@/core/hooks/useFetchInfiniteFilteredSourceCatalogueTags';
import { Button, Spin } from 'antd';
import { useState } from 'react';

export const CatalogueTags = ({
  onChange,
}: {
  onChange?: (tags: string[]) => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const { data, isLoading, error } =
    useFetchInfiniteFilteredSourceCatalogueTags({ name: search });

  const handleTagClick = (tagId: string) => {
    if (selectedTags.has(tagId)) {
      setSelectedTags(new Set([...selectedTags].filter((id) => id !== tagId)));
    } else {
      setSelectedTags(new Set(selectedTags.add(tagId)));
    }
    onChange?.(Array.from(selectedTags));
  };

  return (
    <div className="flex h-[32px] items-center gap-2">
      <CollapsibleSearchInput
        placeholder="Search tags"
        className="w-96"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
      />

      <div className="flex gap-2">
        {isLoading && (
          <span className="flex items-center gap-2 w-full justify-center">
            <Spin /> <span className="sr-only">Loading...</span>
          </span>
        )}
        {error && (
          <NotificationCard
            type="error"
            title="Error loading tags"
            description={error.message}
          />
        )}
        {data?.items.length > 0 ? (
          data?.items.map((item) => (
            <Button
              key={item.id}
              onClick={() => handleTagClick(item.id)}
              className={
                selectedTags.has(item.id)
                  ? 'bg-tertiary/50 text-foreground-muted dark:text-dark-foreground'
                  : ''
              }
            >
              {item.name}
            </Button>
          ))
        ) : (
          <NotificationCard title="No tags found" />
        )}
      </div>
    </div>
  );
};
