import {
  AddSchemaTable,
  RowSchema,
} from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import type { SchemaColumnRow } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable/types';
import { useCreateSchemaFormContext } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.context';
import { IconAlertCircle } from '@repo/dfe-icons';
import { FormRule } from 'antd';
import uniq from 'lodash/uniq';
import z from 'zod';

/** Failed `rowSchema.safeParse` augmented with the raw row (e.g. upload import). */
export type InvalidColumns<T extends SchemaColumnRow = SchemaColumnRow> = {
  success: false;
  error: z.ZodError<RowSchema>;
  data: T;
};

export const InvalidColumnsCollapse = ({
  invalidColumns,
  formValidation,
}: {
  invalidColumns: InvalidColumns[];
  formValidation: FormRule;
}) => {
  const { form } = useCreateSchemaFormContext();
  const initialValues = invalidColumns.map((column) => column.data);

  const invalidFields = uniq(
    invalidColumns.flatMap((column) =>
      column.error.issues.map((issue) => issue.path.join('.')),
    ),
  ) as (keyof RowSchema)[];

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
        formValidation={formValidation}
        config={{
          defaultEditFields: invalidFields.length > 0 ? invalidFields : false,
          defaultAddColumns: false,
          defaultRemoveColumns: true,
        }}
        pagination={false}
        onMount={() => {
          form.validateFields();
        }}
      />
    </div>
  );
};
