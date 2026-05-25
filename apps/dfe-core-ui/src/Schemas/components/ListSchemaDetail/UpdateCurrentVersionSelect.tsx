import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { useUpdateSchema } from '@/Schemas/hooks/useUpdateSchema';

interface UpdateCurrentVersionSelectProps {
  versions: { label: string; value: string }[];
  path: string;
  currentVersion: string;
  refetchSchemaDetail: () => void;
  handleSetSelectedSchema: (version: string) => void;
}
export const UpdateCurrentVersionSelect = ({
  versions,
  path,
  currentVersion,
  refetchSchemaDetail,
  handleSetSelectedSchema,
}: UpdateCurrentVersionSelectProps) => {
  const {
    mutate: updateSchema,
    error,
    isPending: isUpdatingSchema,
    reset,
  } = useUpdateSchema({
    onSuccess: ({ current }) => {
      handleSetSelectedSchema(current);
      void refetchSchemaDetail();
    },
  });

  return (
    <div className="flex items-center gap-2">
      <InlineEditSelect
        classNames={{
          select: 'min-w-48',
        }}
        options={versions}
        disabled={isUpdatingSchema}
        onChange={(e) => {
          updateSchema({
            schema: {
              current: e.target.value,
            },
            parameters: {
              schema_path: path,
            },
          });
        }}
        onEdit={() => {
          reset();
        }}
        value={currentVersion}
      />
      {error && (
        <div className="text-error">
          {error.message ?? 'Error updating current version.'}
        </div>
      )}
    </div>
  );
};
