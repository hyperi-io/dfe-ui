import { AddFromCatalogueContent } from '@/core/components/AddFromCatalogueContent';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IconArrowLeft } from '@repo/dfe-icons';
import { Button, Card } from 'antd';
import { useState, useSyncExternalStore } from 'react';
import {
  getCreatedSourceCount,
  rememberCreatedSources,
  subscribeCreatedSourceCount,
} from './createdSources';
import { TagSelect } from './TagSelect';

export const ConfigureSourceStep = ({
  goPrevious,
  goNext,
}: {
  goPrevious: () => void;
  goNext: () => void;
}) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const createdCount = useSyncExternalStore(
    subscribeCreatedSourceCount,
    getCreatedSourceCount,
    () => null,
  );

  const { componentHeight } = useSetComponentHeight({
    offset: 200,
  });
  return (
    <Card
      classNames={{
        root: 'w-3/4 min-h-[400px] my-4',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure Source</h1>

      {createdCount !== null && (
        <NotificationCard
          type="success"
          title="Sources created"
          description={`${createdCount} sources created successfully`}
        />
      )}
      {createdCount === null && (
        <CustomScrollbar maxHeight={componentHeight}>
          {selectedTags.size === 0 && (
            <TagSelect
              onChange={(tag) =>
                setSelectedTags((prev) => new Set([...prev, tag]))
              }
            />
          )}

          {selectedTags.size > 0 && (
            <AddFromCatalogueContent
              filters={{ tags: Array.from(selectedTags) }}
              onSuccess={() => {
                return goNext();
              }}
              responseController={{
                displayEnabled: false,
                setResponse: (data) => {
                  rememberCreatedSources(data.created.length);
                },
              }}
            />
          )}
        </CustomScrollbar>
      )}
      <div className="flex flex-row justify-between mt-2">
        <Button
          type="text"
          className="text-light p-0 pr-2"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <div className="flex flex-row gap-4 ml-auto">
          <SkipForNow goNext={goNext} />
        </div>
      </div>
    </Card>
  );
};
