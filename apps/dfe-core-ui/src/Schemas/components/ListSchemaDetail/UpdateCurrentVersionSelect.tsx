import { InlineEditSelect } from '@/core/components/Table/InlineEditSelect';
import { useUpdateSchema } from '@/Schemas/hooks/useUpdateSchema';
import { TMetaSchemaUpdateResponse } from '@/Schemas/hooks/useUpdateSchema/types';

interface UpdateCurrentVersionSelectProps {
  versions: { label: string; value: string }[];
  path: string;
  currentVersion: string;
  onSuccess?: (values: TMetaSchemaUpdateResponse) => void;
  editable?: boolean;
}
export const UpdateCurrentVersionSelect = ({
  versions,
  path,
  currentVersion,
  onSuccess,
  editable = true,
}: UpdateCurrentVersionSelectProps) => {
  const {
    mutate: updateSchema,
    error,
    isPending: isUpdatingSchema,
    reset,
  } = useUpdateSchema({
    onSuccess: (values) => {
      onSuccess?.(values);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <InlineEditSelect
        classNames={{
          select: 'min-w-48',
        }}
        options={versions}
        editable={editable}
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
