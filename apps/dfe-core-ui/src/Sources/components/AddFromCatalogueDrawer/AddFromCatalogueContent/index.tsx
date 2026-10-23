import { useState } from 'react';
import {
  AddFromCatalogueForm,
  AddFromCatalogueFormValues,
} from './AddFromCatalogueForm';
import { AddFromCatalogueTable } from './AddFromCatalogueTable';

export const AddFromCatalogueContent = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const [selectedEntries, setSelectedEntries] = useState<
    AddFromCatalogueFormValues[]
  >([]);
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setSelectedEntries([]);
    onSuccess?.();
  };

  return (
    <div className="flex flex-col gap-2">
      {selectedEntries.length > 0 && showForm ? (
        <AddFromCatalogueForm
          initialValues={selectedEntries}
          onFinish={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <AddFromCatalogueTable
          selectedEntries={selectedEntries}
          onSelectedEntriesChange={(entries) => setSelectedEntries(entries)}
          onUpload={() => setShowForm(true)}
        />
      )}
    </div>
  );
};
