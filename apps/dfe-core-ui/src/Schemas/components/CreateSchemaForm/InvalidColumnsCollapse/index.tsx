import { Form } from '@/core/components/Form';
import {
  AddSchemaTable,
  rowSchema,
  RowSchema,
} from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import type { SchemaColumnRow } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable/types';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.context';
import { IconAlertCircle } from '@repo/dfe-icons';
import uniq from 'lodash/uniq';
import { useEffect } from 'react';
import z from 'zod';

/** Failed `rowSchema.safeParse` augmented with the raw row (e.g. upload import). */
export type InvalidColumns<T extends SchemaColumnRow = SchemaColumnRow> = {
  success: false;
  error: z.ZodError<RowSchema>;
  data: T;
};

export const InvalidColumnsCollapse = () => {
  const {
    form,
    handleUpdateInvalidUploadedSchemaColumn,
    handleRemoveUploadedSchemaColumn,
    invalidUploadedSchemaColumns,
    formValidation,
  } = useCreateSchemaFormContext();
  const initialValues = invalidUploadedSchemaColumns.map(
    (column) => column.data,
  );

  const invalidFields = uniq(
    invalidUploadedSchemaColumns.flatMap((column) =>
      column.error.issues.map((issue) => issue.path.join('.')),
    ),
  ) as (keyof RowSchema)[];

  const watchInvalidColumns = Form.useWatch('invalidColumns', form);

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
        onMount={() => {
          form.validateFields();
        }}
      />
    </div>
  );
};
