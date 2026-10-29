import { useCreateBulkSourceFromCatalogue } from '@/Sources/hooks/useCreateBulkSourceFromCatalogue';
import { useState } from 'react';
import {
  AddFromCatalogueForm,
  AddFromCatalogueFormValues,
} from './AddFromCatalogueForm';
import { AddFromCatalogueResponse } from './AddFromCatalogueResponse';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

export const AddFromCatalogueContent = ({
  filters,
}: {
  filters: {
    tags?: string[];
  };
}) => {
  const [selectedEntries, setSelectedEntries] = useState<
    AddFromCatalogueFormValues[]
  >([]);

  const [showForm, setShowForm] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const {
    data: createBulkSourcesResponse,
    mutate: createBulkSources,
    isPending,
    error,
    reset,
  } = useCreateBulkSourceFromCatalogue({
    onSuccess: () => {
      setShowResponse(true);
    },
  });

  const handleFinish = (values: AddFromCatalogueFormValues[]) => {
    createBulkSources({ entries: values });
  };

  const handleCancel = () => {
    setShowForm(false);
    reset();
  };

  return showResponse ? (
    <AddFromCatalogueResponse data={createBulkSourcesResponse} />
  ) : (
    <div className="flex flex-col gap-2">
      {selectedEntries.length > 0 && showForm ? (
        <AddFromCatalogueForm
          initialValues={selectedEntries}
          onFinish={handleFinish}
          onSelectedEntriesChange={setSelectedEntries}
          onCancel={handleCancel}
          error={error}
          isPending={isPending}
        />
      ) : (
        <AddFromCatalogueTable
          filters={filters}
          selectedEntries={selectedEntries}
          onSelectedEntriesChange={(entries) => setSelectedEntries(entries)}
          onUpload={() => setShowForm(true)}
        />
      )}
    </div>
  );
};
