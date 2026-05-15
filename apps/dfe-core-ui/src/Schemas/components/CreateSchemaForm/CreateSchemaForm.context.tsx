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

/** Whether antd `onValuesChange` first arg includes edits under `uploadedColumns`. */
const changedValuesMayAffectUploadedColumns = (changed: unknown): boolean => {
  if (changed == null || typeof changed !== 'object') return false;
  if (Array.isArray(changed)) {
    return changed.some((entry) =>
      changedValuesMayAffectUploadedColumns(entry),
    );
  }
  const rec = changed as Record<string, unknown>;
  if (Object.hasOwn(rec, 'uploadedColumns')) {
    return true;
  }
  return Object.values(rec).some((v) =>
    changedValuesMayAffectUploadedColumns(v),
  );
};

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
  handleUpdateUploadedSchemaColumns: (changedValues: unknown) => void;
  handleRemoveUploadedSchemaColumn: (columnId: string | undefined) => void;
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

  const handleUpdateUploadedSchemaColumns = useCallback(
    (changedValues: unknown) => {
      if (!changedValuesMayAffectUploadedColumns(changedValues)) {
        return;
      }
      const uploadedFormRows = form.getFieldValue('uploadedColumns') as unknown;
      if (!Array.isArray(uploadedFormRows)) {
        return;
      }

      const invalid = invalidUploadedSchemaColumnsRef.current;
      const uploaded = uploadedSchemaColumnsRef.current;
      if (invalid.length === 0) {
        return;
      }

      for (const inv of invalid) {
        const id = inv.data.id;
        if (!id) continue;

        const byFormId = uploadedFormRows.find(
          (r: { id?: string }) => typeof r?.id === 'string' && r.id === id,
        );
        const rowIdx = uploaded.findIndex((u) => u.id === id);
        const formRow =
          byFormId ?? (rowIdx >= 0 ? uploadedFormRows[rowIdx] : undefined);
        if (!formRow || typeof formRow !== 'object') continue;

        const merged = { ...inv.data, ...formRow, id };
        const parsed = rowSchema.safeParse(merged);
        if (!parsed.success) continue;

        handleUpdateInvalidUploadedSchemaColumn(parsed.data);
      }
    },
    [form, handleUpdateInvalidUploadedSchemaColumn],
  );

  const handleRemoveUploadedSchemaColumn = useCallback(
    (columnId: string | undefined) => {
      if (!columnId) return;

      const prevUploaded = uploadedSchemaColumnsRef.current;
      const prevInvalid = invalidUploadedSchemaColumnsRef.current;

      const inUploaded = prevUploaded.some((u) => u.id === columnId);
      const inInvalid = prevInvalid.some((inv) => inv.data.id === columnId);
      if (!inUploaded && !inInvalid) {
        return;
      }

      const nextUploaded = prevUploaded.filter((u) => u.id !== columnId);
      const nextInvalid = prevInvalid.filter((inv) => inv.data.id !== columnId);

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
        void form.validateFields();
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
      handleUpdateUploadedSchemaColumns,
      handleRemoveUploadedSchemaColumn,
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
      handleUpdateUploadedSchemaColumns,
      handleRemoveUploadedSchemaColumn,
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
