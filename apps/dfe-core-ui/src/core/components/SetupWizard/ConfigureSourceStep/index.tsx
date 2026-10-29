import { NotificationCard } from '@/core/components/NotificationCard';
import { SkipForNow } from '@/core/components/SetupWizard/SkipForNow';
import { AddFromCatalogueContent } from '@/Sources/components/AddFromCatalogueDrawer/AddFromCatalogueContent';
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
  return (
    <Card
      classNames={{
        root: 'w-3/4',
        body: 'flex flex-col gap-2',
      }}
    >
      <h1 className="text-2xl font-light">Configure Source</h1>

      <NotificationCard
        className="mb-4"
        title="Create source from catalogue"
        description="Select a catalogue category to get started."
      />

      {selectedTags.size === 0 && (
        <TagSelect
          onChange={(tag) => setSelectedTags((prev) => new Set([...prev, tag]))}
        />
      )}

      {selectedTags.size > 0 && (
        <AddFromCatalogueContent filters={{ tags: Array.from(selectedTags) }} />
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
