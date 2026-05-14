import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import type { FormInstance, FormRule } from 'antd';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CreateSchemaFormData } from '.';
import { formSchema } from '.';
import { rowSchema, RowSchema } from './AddSchemaTable';
import { InvalidColumns } from './InvalidColumnsCollapse';
import { UploadedSchemaRow } from './types';

export type UploadInvalidSyncState = {
  initialInvalidIds: Set<string>;
  invalidSectionActive: boolean;
};

export interface CreateSchemaFormContextValue {
  form: FormInstance<CreateSchemaFormData>;
  uploadedSchemaColumns: UploadedSchemaRow[];
  handleSetUploadedSchemaColumns: (columns: UploadedSchemaRow[]) => void;
  invalidUploadedSchemaColumns: InvalidColumns[];
  handleSetInvalidUploadedSchemaColumns: (columns: InvalidColumns[]) => void;
  schemaColumns: RowSchema[];
  handleSetSchemaColumns: (columns: RowSchema[]) => void;
  formValidation: FormRule;
  handleUpdateInvalidUploadedSchemaColumn: (column: InvalidColumns) => void;
}

const CreateSchemaUploadContext =
  createContext<CreateSchemaFormContextValue | null>(null);

export const CreateSchemaFormProvider = ({
  form,
  children,
}: {
  form: FormInstance<CreateSchemaFormData>;
  children: ReactNode;
}) => {
  const formValidation = useAntdZodResolver<CreateSchemaFormData>(formSchema);

  const [schemaColumns, setSchemaColumns] = useState<RowSchema[]>([]);
  const [uploadedSchemaColumns, setUploadedSchemaColumns] = useState<
    UploadedSchemaRow[]
  >([]);
  const [invalidUploadedSchemaColumns, setInvalidUploadedSchemaColumns] =
    useState<InvalidColumns[]>([]);

  const handleSetSchemaColumns = useCallback((columns: RowSchema[]) => {
    setSchemaColumns(columns);
  }, []);

  const handleSetUploadedSchemaColumns = useCallback(
    (columns: UploadedSchemaRow[]) => {
      const validatedData = columns.map((value) => {
        const validationResult = rowSchema.safeParse(value);
        if (!validationResult.success) {
          return {
            ...validationResult,
            data: value,
          };
        }
        return validationResult;
      });

      const invalidData = validatedData.filter((value) => !value.success);

      setUploadedSchemaColumns(columns);
      setInvalidUploadedSchemaColumns(invalidData);
    },
    [],
  );

  const handleSetInvalidUploadedSchemaColumns = useCallback(
    (columns: InvalidColumns[]) => {
      setInvalidUploadedSchemaColumns(columns);
    },
    [],
  );

  const handleUpdateInvalidUploadedSchemaColumn = useCallback(
    (column: InvalidColumns) => {
      const validate = rowSchema.safeParse(column.data);
      if (!validate.success) return;

      const index = uploadedSchemaColumns.findIndex(
        (value) => value.id === column.data.id,
      );
      if (index === -1) return;

      const updatedColumns = [...uploadedSchemaColumns];
      updatedColumns[index] = validate.data;
      setUploadedSchemaColumns(updatedColumns);
    },
    [uploadedSchemaColumns],
  );

  const value = useMemo(
    () => ({
      form,
      uploadedSchemaColumns,
      handleSetUploadedSchemaColumns,
      invalidUploadedSchemaColumns,
      handleSetInvalidUploadedSchemaColumns,
      schemaColumns,
      handleSetSchemaColumns,
      formValidation,
      handleUpdateInvalidUploadedSchemaColumn,
    }),
    [
      form,
      uploadedSchemaColumns,
      handleSetUploadedSchemaColumns,
      invalidUploadedSchemaColumns,
      handleSetInvalidUploadedSchemaColumns,
      schemaColumns,
      handleSetSchemaColumns,
      formValidation,
      handleUpdateInvalidUploadedSchemaColumn,
    ],
  );
  return (
    <CreateSchemaUploadContext.Provider value={value}>
      {children}
    </CreateSchemaUploadContext.Provider>
  );
};

export const useCreateSchemaFormContext = () => {
  const ctx = useContext(CreateSchemaUploadContext);
  if (!ctx) {
    throw new Error(
      'useCreateSchemaFormContext must be used within CreateSchemaFormProvider',
    );
  }
  return ctx;
};
