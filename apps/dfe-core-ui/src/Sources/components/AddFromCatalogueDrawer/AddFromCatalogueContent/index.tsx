import { TCatalogueEntry } from '@/Sources/hooks/useFetchSourceCatalogue/types';
import { useState } from 'react';
import { AddFromCatalogueForm } from './AddFromCatalogueForm';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

export const AddFromCatalogueContent = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [selectedEntry, setSelectedEntry] = useState<TCatalogueEntry>();
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
