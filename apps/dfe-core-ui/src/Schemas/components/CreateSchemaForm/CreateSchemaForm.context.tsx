import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import type { FormInstance, FormRule } from 'antd';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { CreateSchemaFormData } from '.';
import { formSchema } from '.';
import { rowSchema, RowSchema } from './AddSchemaTable';
import { listItemFromPartial } from './AddSchemaTable/AddSchemaTable.helpers';
import { InvalidColumns } from './InvalidColumnsCollapse';
import { UploadedSchemaRow } from './types';

/** Revalidate nested `uploadedColumns` paths after programmatic merge — clears stale `Form.Item` errors. */
const UPLOADED_ROW_FIELD_KEYS = [
  'name',
  'type',
  'use_case',
  'attribute',
  'expr',
  'comment',
  'id',
] as const;

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

  /** Latest columns for synchronous promotion writes (invalidate form + uploaded form fields together). */
  const uploadedSchemaColumnsRef = useRef(uploadedSchemaColumns);
  const invalidUploadedSchemaColumnsRef = useRef(invalidUploadedSchemaColumns);

  useLayoutEffect(() => {
    uploadedSchemaColumnsRef.current = uploadedSchemaColumns;
    invalidUploadedSchemaColumnsRef.current = invalidUploadedSchemaColumns;
  }, [uploadedSchemaColumns, invalidUploadedSchemaColumns]);

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

  const handleUpdateInvalidUploadedSchemaColumn = useCallback(
    (column: RowSchema) => {
      const validatedColumn = rowSchema.safeParse(column);
      if (!validatedColumn.success) {
        setInvalidUploadedSchemaColumns((prev) => {
          const idx = prev.findIndex((inv) => inv.data.id === column.id);
          const entry = { ...validatedColumn, data: column };
          if (idx === -1) {
            return [...prev, entry];
          }
          const next = [...prev];
          next[idx] = entry;
          return next;
        });
        return;
      }

      const prevUploaded = uploadedSchemaColumnsRef.current;
      const prevInvalid = invalidUploadedSchemaColumnsRef.current;
      const replaceIndex = prevUploaded.findIndex(
        (value) => value.id === column.id,
      );
      if (replaceIndex === -1) return;

      const nextUploaded = [...prevUploaded];
      nextUploaded[replaceIndex] = validatedColumn.data;

      const nextInvalid = prevInvalid.filter(
        (inv) => inv.data.id !== column.id,
      );

      setUploadedSchemaColumns(nextUploaded);
      setInvalidUploadedSchemaColumns(nextInvalid);
      uploadedSchemaColumnsRef.current = nextUploaded;
      invalidUploadedSchemaColumnsRef.current = nextInvalid;

      form.setFieldsValue({
        uploadedColumns: nextUploaded.map((c) => listItemFromPartial(c)),
        invalidColumns:
          nextInvalid.length > 0
            ? nextInvalid.map((inv) => listItemFromPartial(inv.data))
            : [],
      });

      queueMicrotask(() => {
        void form.validateFields(
          UPLOADED_ROW_FIELD_KEYS.map((k) => [
            'uploadedColumns',
            replaceIndex,
            k,
          ]),
        );
      });
    },
    [form],
  );

  const value = useMemo(
    () => ({
      form,
      uploadedSchemaColumns,
      handleSetUploadedSchemaColumns,
      invalidUploadedSchemaColumns,
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
