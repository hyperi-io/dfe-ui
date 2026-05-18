import type { RowSchema } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { SchemaColumnRow } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable/types';
import type {
  CreateSchemaFormData,
  SchemaFormValidationErrors,
} from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import type { UploadedSchemaRow } from '@/Schemas/components/CreateSchemaForm/types';
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
  success: false;
  error: z.ZodError<RowSchema>;
  data: T;
};
