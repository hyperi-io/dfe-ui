import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  rowSchema,
  RowSchema,
} from '@/Schemas/components/CreateSchemaForm/AddSchemaTable';
import { listItemFromPartial } from '@/Schemas/components/CreateSchemaForm/AddSchemaTable/AddSchemaTable.helpers';
import {
  formSchema,
  SchemaFormValidationErrors,
  type CreateSchemaFormData,
} from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { UploadedSchemaRow } from '@/Schemas/components/CreateSchemaForm/types';
import type { FormInstance } from 'antd';
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
import {
  type CreateSchemaFormContextValue,
  type InvalidColumns,
} from './CreateSchemaForm.context.d';
import {
  changedValuesMayAffectTabLists,
  changedValuesMayAffectUploadedColumns,
  createEmptyValidationErrors,
  mergeImportInvalidIntoUploadedTab,
  transformFieldErrorsToTabErrors,
  UPLOADED_ROW_FIELD_KEYS,
} from './CreateSchemaForm.context.helpers';

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

  const [validationErrors, setValidationErrors] =
    useState<SchemaFormValidationErrors>(() => createEmptyValidationErrors());

  /** Latest columns for synchronous promotion writes (invalidate form + uploaded form fields together). */
  const uploadedSchemaColumnsRef = useRef(uploadedSchemaColumns);
  const invalidUploadedSchemaColumnsRef = useRef(invalidUploadedSchemaColumns);

  useLayoutEffect(() => {
    uploadedSchemaColumnsRef.current = uploadedSchemaColumns;
    invalidUploadedSchemaColumnsRef.current = invalidUploadedSchemaColumns;
  }, [uploadedSchemaColumns, invalidUploadedSchemaColumns]);

  const recomputeValidationErrors = useCallback(() => {
    const base = transformFieldErrorsToTabErrors(form.getFieldsError());
    setValidationErrors(
      mergeImportInvalidIntoUploadedTab(
        base,
        invalidUploadedSchemaColumnsRef.current,
      ),
    );
  }, [form]);

  const __internal_collectTabErrorsAfterValidate =
    useCallback(async (): Promise<SchemaFormValidationErrors> => {
      try {
        await form.validateFields();
      } catch {
        /* rejected when rules fail — errors remain on fields */
      }
      const base = transformFieldErrorsToTabErrors(form.getFieldsError());
      return mergeImportInvalidIntoUploadedTab(
        base,
        invalidUploadedSchemaColumnsRef.current,
      );
    }, [form]);

  /**
   * Tables sync uploaded rows into the form store in child `useLayoutEffect`.
   * Parent layout runs after children, then we validate so nested list rules run
   * and tab errors update (reading `getFieldsError()` during render does not).
   */
  useLayoutEffect(() => {
    if (
      uploadedSchemaColumns.length === 0 &&
      invalidUploadedSchemaColumns.length === 0
    ) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      void __internal_collectTabErrorsAfterValidate().then((next) => {
        if (!cancelled) {
          setValidationErrors(next);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    __internal_collectTabErrorsAfterValidate,
    uploadedSchemaColumns,
    invalidUploadedSchemaColumns,
  ]);

  const changedValuesTriggerInvalidTabErrors = useCallback(
    (changedValues: unknown) => {
      return changedValuesMayAffectTabLists(changedValues);
    },
    [],
  );

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
        queueMicrotask(() => {
          void __internal_collectTabErrorsAfterValidate().then(
            setValidationErrors,
          );
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
        void (async () => {
          try {
            await form.validateFields(
              UPLOADED_ROW_FIELD_KEYS.map((k) => [
                'uploadedColumns',
                replaceIndex,
                k,
              ]),
            );
          } catch {
            /* noop */
          }
          setValidationErrors(
            mergeImportInvalidIntoUploadedTab(
              transformFieldErrorsToTabErrors(form.getFieldsError()),
              invalidUploadedSchemaColumnsRef.current,
            ),
          );
        })();
      });
    },
    [form, __internal_collectTabErrorsAfterValidate],
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
      queueMicrotask(() => {
        void __internal_collectTabErrorsAfterValidate().then(
          setValidationErrors,
        );
      });
    },
    [
      form,
      handleUpdateInvalidUploadedSchemaColumn,
      __internal_collectTabErrorsAfterValidate,
    ],
  );

  const handleValidate = useCallback(() => {
    void __internal_collectTabErrorsAfterValidate().then(setValidationErrors);
  }, [__internal_collectTabErrorsAfterValidate]);

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
        void __internal_collectTabErrorsAfterValidate().then(
          setValidationErrors,
        );
      });
    },
    [form, __internal_collectTabErrorsAfterValidate],
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
      validationErrors,
      changedValuesTriggerInvalidTabErrors,
      recomputeValidationErrors,
      handleValidate,
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
      validationErrors,
      changedValuesTriggerInvalidTabErrors,
      recomputeValidationErrors,
      handleValidate,
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
