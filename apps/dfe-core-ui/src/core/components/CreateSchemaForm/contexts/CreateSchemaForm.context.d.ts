import type { RowSchema } from '@/core/components/CreateSchemaForm/AddSchemaTable';
import { SchemaColumnRow } from '@/core/components/CreateSchemaForm/AddSchemaTable/types';
import type { UploadedSchemaRow } from '@/core/components/CreateSchemaForm/types';
import type {
  CreateSchemaFormData,
  SchemaFormValidationErrors,
} from '@/core/schemas/CreateSchemaForm/CreateSchemaForm.schema';
import type { FormInstance, FormRule } from 'antd';
import z from 'zod';

export type UploadInvalidSyncState = {
  initialInvalidIds: Set<string>;
  invalidSectionActive: boolean;
};

export interface CreateSchemaFormContextValue {
  form: FormInstance<CreateSchemaFormData>;
  uploadedSchemaColumns: UploadedSchemaRow[];
  handleSetUploadedSchemaColumns: (columns: UploadedSchemaRow[]) => void;
  invalidUploadedSchemaColumns: InvalidColumns[];
  schemaColumns: RowSchema[];
  handleSetSchemaColumns: (columns: RowSchema[]) => void;
  handleUpdateSchemaColumns: (
    changedValues: unknown,
    allValues: CreateSchemaFormData,
  ) => void;
  handleFormValuesChange: (
    changedValues: unknown,
    allValues: CreateSchemaFormData,
  ) => void;
  formValidation: FormRule;
  handleUpdateInvalidUploadedSchemaColumn: (column: RowSchema) => void;
  handleUpdateUploadedSchemaColumns: (changedValues: unknown) => void;
  handleRemoveUploadedSchemaColumn: (columnId: string | undefined) => void;
  validationErrors: SchemaFormValidationErrors;
  changedValuesTriggerInvalidTabErrors: (changedValues: unknown) => boolean;
  recomputeValidationErrors: () => void;
  handleValidate: () => void;
  /** Re-run list row rules only (uploaded / invalid / schema column tables), not schema-details fields. */
  handleValidateColumnListsOnly: () => void;
}

export type InvalidColumns<T extends SchemaColumnRow = SchemaColumnRow> = {
  success: boolean;
  error: z.ZodError<RowSchema>;
  data: T;
};
