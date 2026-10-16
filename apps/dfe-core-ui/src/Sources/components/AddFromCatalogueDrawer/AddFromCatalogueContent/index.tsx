import { TSourceCatalogueItem } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { useState } from 'react';
import { AddFromCatalogueForm } from './AddFromCatalogueForm';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

export const AddFromCatalogueContent = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [selectedEntry, setSelectedEntry] = useState<TSourceCatalogueItem>();
  const handleSuccess = () => {
    setSelectedEntry(undefined);
    onSuccess?.();
  };
  return selectedEntry ? (
    <AddFromCatalogueForm
      entry={selectedEntry}
      onCancel={() => setSelectedEntry(undefined)}
      onSuccess={handleSuccess}
    />
  ) : (
    <AddFromCatalogueTable onSelect={(entry) => setSelectedEntry(entry)} />
  );
};
