import { useAntdZodResolver } from '@/core/utils/zod/useAntdZodResolver';
import {
  isBlankSchemaListRow,
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
import { Form } from 'antd';
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
  allColumnTabListValidatePaths,
  changedValuesMayAffectTabLists,
  createEmptyValidationErrors,
  mergeImportInvalidIntoUploadedTab,
  transformFieldErrorsToTabErrors,
  UPLOADED_ROW_FIELD_KEYS,
  uploadedAndInvalidColumnListValidatePaths,
} from './CreateSchemaForm.context.helpers';

const CreateSchemaUploadContext =
  createContext<CreateSchemaFormContextValue | null>(null);

export const CreateSchemaFormProvider = ({
  children,
  testValue: testValueProp,
}: {
  children: ReactNode;
  testValue?: Partial<CreateSchemaFormContextValue>;
}) => {
  const [form] = Form.useForm<CreateSchemaFormData>();
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
  const prevSchemaColumnsLengthRef = useRef(0);

  useLayoutEffect(() => {
    uploadedSchemaColumnsRef.current = uploadedSchemaColumns;
    invalidUploadedSchemaColumnsRef.current = invalidUploadedSchemaColumns;
  }, [uploadedSchemaColumns, invalidUploadedSchemaColumns]);

  useLayoutEffect(() => {
    const cols = form.getFieldValue('schemaColumns');
    prevSchemaColumnsLengthRef.current = Array.isArray(cols) ? cols.length : 0;
  }, [form]);

  const recomputeValidationErrors = useCallback(() => {
    const base = transformFieldErrorsToTabErrors(form.getFieldsError());
    setValidationErrors(
      mergeImportInvalidIntoUploadedTab(
        base,
        invalidUploadedSchemaColumnsRef.current,
      ),
    );
  }, [form]);

  /**
   * @param nameList `undefined` — validate entire form; `[]` — skip `validateFields`, only merge tab errors; non-empty — partial.
   */
  const __internal_collectTabErrorsAfterValidate = useCallback(
    async (
      nameList?: (string | number)[][],
    ): Promise<SchemaFormValidationErrors> => {
      try {
        if (nameList === undefined) {
          await form.validateFields();
        } else if (nameList.length > 0) {
          await form.validateFields(nameList);
        }
      } catch {
        /* rejected when rules fail — errors remain on fields */
      }
      const base = transformFieldErrorsToTabErrors(form.getFieldsError());
      return mergeImportInvalidIntoUploadedTab(
        base,
        invalidUploadedSchemaColumnsRef.current,
      );
    },
    [form],
  );

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

    const columnListPaths = uploadedAndInvalidColumnListValidatePaths(
      uploadedSchemaColumns.length,
      invalidUploadedSchemaColumns.length,
    );

    let cancelled = false;
    queueMicrotask(() => {
      void __internal_collectTabErrorsAfterValidate(columnListPaths).then(
        (next) => {
          if (!cancelled) {
            setValidationErrors(next);
          }
        },
      );
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

  const handleSetSchemaColumns = useCallback(
    (columns: RowSchema[]) => {
      setSchemaColumns(columns);
      form.setFieldsValue({
        schemaColumns: columns.map((c) => listItemFromPartial(c)),
      });
    },
    [form],
  );

  const handleUpdateSchemaColumns = useCallback(
    (changedValues: unknown, allValues: CreateSchemaFormData) => {
      if (!changedValuesMayAffectTabLists(changedValues)) {
        return;
      }
      const cols = allValues.schemaColumns;
      setSchemaColumns(Array.isArray(cols) ? cols : []);
    },
    [],
  );

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
        const prevInv = invalidUploadedSchemaColumnsRef.current;
        const invIdx = prevInv.findIndex((inv) => inv.data.id === column.id);
        const nextInvalidLen =
          invIdx === -1 ? prevInv.length + 1 : prevInv.length;

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
          void __internal_collectTabErrorsAfterValidate(
            uploadedAndInvalidColumnListValidatePaths(
              uploadedSchemaColumnsRef.current.length,
              nextInvalidLen,
            ),
          ).then(setValidationErrors);
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
      if (!changedValuesMayAffectTabLists(changedValues)) {
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
        void __internal_collectTabErrorsAfterValidate(
          uploadedAndInvalidColumnListValidatePaths(
            uploadedSchemaColumnsRef.current.length,
            invalidUploadedSchemaColumnsRef.current.length,
          ),
        ).then(setValidationErrors);
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

  const handleValidateColumnListsOnly = useCallback(() => {
    const uploaded = form.getFieldValue('uploadedColumns');
    const invalid = form.getFieldValue('invalidColumns');
    const schemaCols = form.getFieldValue('schemaColumns');
    const paths = allColumnTabListValidatePaths(
      Array.isArray(uploaded) ? uploaded.length : 0,
      Array.isArray(invalid) ? invalid.length : 0,
      Array.isArray(schemaCols) ? schemaCols.length : 0,
    );
    void __internal_collectTabErrorsAfterValidate(paths).then(
      setValidationErrors,
    );
  }, [form, __internal_collectTabErrorsAfterValidate]);

  const handleFormValuesChange = useCallback(
    (changedValues: unknown, allValues: CreateSchemaFormData) => {
      handleUpdateUploadedSchemaColumns(changedValues);
      handleUpdateSchemaColumns(changedValues, allValues);

      const touchedLists = changedValuesTriggerInvalidTabErrors(changedValues);
      const cv = changedValues as Record<string, unknown>;
      const schemaCols = allValues.schemaColumns;
      const nextLen = Array.isArray(schemaCols) ? schemaCols.length : 0;
      const prevLen = prevSchemaColumnsLengthRef.current;

      const onlySchemaColumnsChanged =
        touchedLists &&
        cv !== null &&
        typeof cv === 'object' &&
        Object.keys(cv).length === 1 &&
        Object.hasOwn(cv, 'schemaColumns');

      const appendedSingleBlankRow =
        onlySchemaColumnsChanged &&
        Array.isArray(schemaCols) &&
        nextLen === prevLen + 1 &&
        isBlankSchemaListRow(schemaCols[nextLen - 1]);

      prevSchemaColumnsLengthRef.current = nextLen;

      /** List validators are async — avoid preemptive full validate when Add Column appends one blank row. */
      if (!touchedLists) {
        queueMicrotask(() => recomputeValidationErrors());
        return;
      }
      if (appendedSingleBlankRow) {
        queueMicrotask(() => recomputeValidationErrors());
        return;
      }
      queueMicrotask(() => handleValidateColumnListsOnly());
    },
    [
      handleUpdateUploadedSchemaColumns,
      handleUpdateSchemaColumns,
      changedValuesTriggerInvalidTabErrors,
      recomputeValidationErrors,
      handleValidateColumnListsOnly,
    ],
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
        void __internal_collectTabErrorsAfterValidate(
          uploadedAndInvalidColumnListValidatePaths(
            nextUploaded.length,
            nextInvalid.length,
          ),
        ).then(setValidationErrors);
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
      handleUpdateSchemaColumns,
      handleFormValuesChange,
      formValidation,
      handleUpdateInvalidUploadedSchemaColumn,
      handleUpdateUploadedSchemaColumns,
      handleRemoveUploadedSchemaColumn,
      validationErrors,
      changedValuesTriggerInvalidTabErrors,
      recomputeValidationErrors,
      handleValidate,
      handleValidateColumnListsOnly,
    }),
    [
      form,
      uploadedSchemaColumns,
      handleSetUploadedSchemaColumns,
      invalidUploadedSchemaColumns,
      schemaColumns,
      handleSetSchemaColumns,
      handleUpdateSchemaColumns,
      handleFormValuesChange,
      formValidation,
      handleUpdateInvalidUploadedSchemaColumn,
      handleUpdateUploadedSchemaColumns,
      handleRemoveUploadedSchemaColumn,
      validationErrors,
      changedValuesTriggerInvalidTabErrors,
      recomputeValidationErrors,
      handleValidate,
      handleValidateColumnListsOnly,
    ],
  );

  const contextValue =
    process.env.NODE_ENV === 'test' && testValueProp
      ? {
          ...value,
          ...testValueProp,
        }
      : value;
  return (
    <CreateSchemaUploadContext.Provider value={contextValue}>
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
