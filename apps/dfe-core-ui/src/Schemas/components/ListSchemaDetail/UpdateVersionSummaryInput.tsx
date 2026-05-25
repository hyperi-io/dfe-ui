import { InlineEditInput } from '@/core/components/Table/InlineEditInput';
import { useUpdateSchema } from '@/Schemas/hooks/useUpdateSchema';

interface UpdateVersionSummaryInputProps {
  path: string;
  version: string;
  summary: string;
  refetchSchemaDetail: () => void;
}
export const UpdateVersionSummaryInput = ({
  path,
  version,
  summary,
  refetchSchemaDetail,
}: UpdateVersionSummaryInputProps) => {
  const {
    mutate: updateSchema,
    error,
    isPending: isUpdatingSchema,
    reset,
  } = useUpdateSchema({
    onSuccess: () => {
      void refetchSchemaDetail();
    },
  });

  return (
    <div className="flex items-center gap-2">
      <InlineEditInput
        classNames={{
          input: 'min-w-96',
        }}
        disabled={isUpdatingSchema}
        onChange={(e) => {
          updateSchema({
            schema: {
              summary: e.target.value,
            },
            parameters: {
              schema_path: path,
              version: version,
            },
          });
        }}
        onEdit={() => {
          reset();
        }}
        value={summary}
      />
      {error && (
        <div className="text-error">
          {error.message ?? 'Error updating summary.'}
        </div>
      )}
    </div>
  );
};
