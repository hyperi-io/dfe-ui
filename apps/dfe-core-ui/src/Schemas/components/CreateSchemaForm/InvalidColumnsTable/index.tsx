import { Form } from '@/core/components/Form';
import { rowSchema } from '@/core/schemas/CreateSchemaForm/AddSchemaTable.schema';
import {
  AddSchemaTable,
  RowSchema,
} from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context';
import { rowListFieldValidatePaths } from '@/Schemas/components/CreateSchemaForm/contexts/CreateSchemaForm.context.helpers';
import { IconAlertCircle } from '@repo/dfe-icons';
import uniq from 'lodash/uniq';
import { useCallback, useEffect } from 'react';

export const InvalidColumnsTable = () => {
  const {
    form,
    handleUpdateInvalidUploadedSchemaColumn,
    handleRemoveUploadedSchemaColumn,
    invalidUploadedSchemaColumns,
    formValidation,
    recomputeValidationErrors,
  } = useCreateSchemaFormContext();
  const initialValues = invalidUploadedSchemaColumns.map(
    (column) => column.data,
  );

  const invalidFields = uniq(
    invalidUploadedSchemaColumns.flatMap((column) =>
      column.error.issues.map((issue) => issue.path.join('.')),
    ),
  ) as (keyof RowSchema)[];

  const watchInvalidColumns = Form.useWatch(
    (values) => values.invalidColumns,
    form,
  );

  /** Stable ref: AddSchemaTable re-runs `onMount` when this identity changes. */
  const validateOnInvalidTableMount = useCallback(() => {
    const paths = rowListFieldValidatePaths(
      'invalidColumns',
      invalidUploadedSchemaColumns.length,
    );
    if (paths.length === 0) {
      return;
    }
    void (async () => {
      try {
        await form.validateFields(paths);
      } catch {
        /* rejected when rules fail — errors remain on fields */
      }
      recomputeValidationErrors();
    })();
  }, [form, invalidUploadedSchemaColumns.length, recomputeValidationErrors]);

  useEffect(() => {
    const validatedColumns = watchInvalidColumns?.map((column, index) => {
      /** Form.Item only registered visible fields historically; preserve stable row id from context when needed. */
      const merged =
        typeof column?.id === 'string' && column.id
          ? column
          : ({
              ...column,
              id: invalidUploadedSchemaColumns[index]?.data.id ?? '',
            } as RowSchema);
      return { data: merged, ...rowSchema.safeParse(merged) };
    });
    const validColumns = validatedColumns?.filter((column) => column.success);

    validColumns?.forEach((column) => {
      handleUpdateInvalidUploadedSchemaColumn(column.data);
    });
  }, [
    watchInvalidColumns,
    invalidUploadedSchemaColumns,
    handleUpdateInvalidUploadedSchemaColumn,
  ]);

  return (
    <div className="border-error border rounded-md p-2 flex flex-col gap-y-2">
      <label
        className="text-error flex items-center gap-x-2"
        htmlFor="invalidColumns"
      >
        <IconAlertCircle /> Invalid Columns
      </label>

      <AddSchemaTable
        name="invalidColumns"
        initialValues={initialValues}
        resetListWhenEmpty
        formValidation={formValidation}
        config={{
          defaultEditFields: invalidFields.length > 0 ? invalidFields : false,
          defaultAddColumns: false,
          defaultRemoveColumns: true,
        }}
        pagination={false}
        onRemoveRow={(row) =>
          handleRemoveUploadedSchemaColumn(
            typeof row?.id === 'string' ? row.id : undefined,
          )
        }
        onMount={validateOnInvalidTableMount}
      />
    </div>
  );
};
