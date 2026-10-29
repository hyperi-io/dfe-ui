import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { AddFromCatalogueContent } from '@/Sources/components/AddFromCatalogueDrawer/AddFromCatalogueContent';
import { TCatalogueBulkSourceResponse } from '@/Sources/hooks/useCreateBulkSourceFromCatalogue/types';
import { IconArrowLeft } from '@repo/dfe-icons';
import { Button, Card } from 'antd';
import { useState } from 'react';
import { TagSelect } from './TagSelect';

export const ConfigureSourceStep = ({
  goPrevious,
  goNext,
}: {
  goPrevious: () => void;
  goNext: () => void;
}) => {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [sourceCreatedResponse, setSourceCreatedResponse] =
    useState<TCatalogueBulkSourceResponse | null>(null);

  const tableOffset = selectedTags.size > 0 ? -300 : 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 650 + tableOffset,
  });
  return (
    <Card
      classNames={{
        root: 'w-3/4 min-h-[400px] max-h-[700px]',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure Source</h1>

      {sourceCreatedResponse && (
        <NotificationCard
          type="success"
          title="Sources created"
          description={`${sourceCreatedResponse.created.length} sources created successfully`}
        />
      )}
      {!sourceCreatedResponse && (
        <CustomScrollbar height={componentHeight}>
          {selectedTags.size === 0 && (
            <TagSelect
              onChange={(tag) =>
                setSelectedTags((prev) => new Set([...prev, tag]))
              }
            />
          )}

          {selectedTags.size > 0 && (
            <AddFromCatalogueContent
              className="max-h-75"
              filters={{ tags: Array.from(selectedTags) }}
              onSuccess={() => {
                return goNext();
              }}
              responseController={{
                displayEnabled: false,
                setResponse: (data) => {
                  setSourceCreatedResponse(data);
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
