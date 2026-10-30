import { useCreateBulkSourceFromCatalogue } from '@/core/hooks/useCreateBulkSourceFromCatalogue';
import { TCatalogueBulkSourceResponse } from '@/core/hooks/useCreateBulkSourceFromCatalogue/types';
import { cn } from '@repo/dfe-shared-ui';
import { useState } from 'react';
import {
  AddFromCatalogueForm,
  AddFromCatalogueFormValues,
} from './AddFromCatalogueForm';
import { AddFromCatalogueResponse } from './AddFromCatalogueResponse';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

export const AddFromCatalogueContent = ({
  filters = {},
  className,
  onSuccess,
  responseController = { displayEnabled: true, setResponse: () => {} },
}: {
  filters?: {
    tags?: string[];
  };
  onSuccess?: () => void;
  responseController?: {
    displayEnabled: boolean;
    setResponse: (response: TCatalogueBulkSourceResponse) => void;
  };
  className?: string;
} = {}) => {
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
    onSuccess: (data) => {
      if (responseController?.displayEnabled) {
        setShowResponse(true);
      }
      responseController?.setResponse(data);
      onSuccess?.();
    },
  });

  const handleFinish = (values: AddFromCatalogueFormValues[]) => {
    createBulkSources({ entries: values });
  };

  const handleCancel = () => {
    setShowForm(false);
    reset();
  };

  return showResponse && responseController?.displayEnabled ? (
    <AddFromCatalogueResponse
      className={className}
      data={createBulkSourcesResponse}
    />
  ) : (
    <div className={cn('flex flex-col gap-2', className)}>
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
