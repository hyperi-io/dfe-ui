import {
  SCHEMA_TAB_FORM_VALIDATION_KEY_MAP,
  SchemaFormValidationErrors,
} from '@/core/schemas/CreateSchemaForm/CreateSchemaForm.schema';
import { FieldError } from '@rc-component/form/es/interface';
import { type InvalidColumns } from './CreateSchemaForm.context.d';

/**
 * Whether `onValuesChange` includes edits under column tabs (`schemaColumns` / upload lists).
 *
 * @param changed - The changed values to check.
 * @returns Whether the changed values may affect the column tabs.
 * @example
 * changedValuesMayAffectTabLists({ schemaColumns: [{ id: '1', name: 'test' }] }) // true
 * changedValuesMayAffectTabLists({ uploadedColumns: [{ id: '1', name: 'test' }] }) // true
 * changedValuesMayAffectTabLists({ invalidColumns: [{ id: '1', name: 'test' }] }) // true
 * changedValuesMayAffectTabLists({ uploadType: 'csv', file: { name: 'test.csv' } }) // false
 * changedValuesMayAffectTabLists({ uploadType: 'json', file: { name: 'test.json' } }) // false
 */
export const changedValuesMayAffectTabLists = (changed: unknown): boolean => {
  if (changed == null || typeof changed !== 'object') return false;
  if (Array.isArray(changed)) {
    return changed.some((entry) => changedValuesMayAffectTabLists(entry));
  }
  const rec = changed as Record<string, unknown>;
  if (
    Object.hasOwn(rec, 'schemaColumns') ||
    Object.hasOwn(rec, 'uploadedColumns') ||
    Object.hasOwn(rec, 'invalidColumns')
  ) {
    return true;
  }
  return Object.values(rec).some((v) =>
    typeof v === 'object' && v !== null
      ? changedValuesMayAffectTabLists(v)
      : false,
  );
};

/**
 * Revalidate nested `uploadedColumns` paths after programmatic merge — clears stale `Form.Item` errors.
 * @returns The keys to revalidate.
 * @example
 * UPLOADED_ROW_FIELD_KEYS // ['name', 'type', 'use_case', 'attribute', 'expr', 'comment', 'id']
 */
export const UPLOADED_ROW_FIELD_KEYS = [
  'name',
  'type',
  'use_case',
  'attribute',
  'expr',
  'comment',
  'id',
] as const;

export type ColumnListFormKey =
  | 'uploadedColumns'
  | 'invalidColumns'
  | 'schemaColumns';

/**
 * Ant Design `validateFields` name paths for every cell in a column table list.
 * Avoids running schema-details rules (name, version, schema type, etc.).
 */
export const rowListFieldValidatePaths = (
  listKey: ColumnListFormKey,
  rowCount: number,
): (string | number)[][] => {
  if (rowCount <= 0) return [];
  const paths: (string | number)[][] = [];
  for (let i = 0; i < rowCount; i++) {
    for (const k of UPLOADED_ROW_FIELD_KEYS) {
      paths.push([listKey, i, k]);
    }
  }
  return paths;
};

export const uploadedAndInvalidColumnListValidatePaths = (
  uploadedRowCount: number,
  invalidRowCount: number,
): (string | number)[][] => [
  ...rowListFieldValidatePaths('uploadedColumns', uploadedRowCount),
  ...rowListFieldValidatePaths('invalidColumns', invalidRowCount),
];

/** Paths for every column tab list — excludes schema-details fields (name, version, type, …). */
export const allColumnTabListValidatePaths = (
  uploadedRowCount: number,
  invalidRowCount: number,
  schemaColumnsRowCount: number,
): (string | number)[][] => [
  ...rowListFieldValidatePaths('uploadedColumns', uploadedRowCount),
  ...rowListFieldValidatePaths('invalidColumns', invalidRowCount),
  ...rowListFieldValidatePaths('schemaColumns', schemaColumnsRowCount),
];

/**
 *
 * @returns The empty validation errors.
 * @example
 * createEmptyValidationErrors() // { schemaDetails: [], uploadedColumns: [], schemaColumns: [], formSchemaControls: [] }
 */
export const createEmptyValidationErrors = (): SchemaFormValidationErrors => ({
  schemaDetails: [],
  uploadedColumns: [],
  schemaColumns: [],
  formSchemaControls: [],
});

/** A set of the schema details keys. */
const SCHEMA_DETAILS_KEY_SET = new Set(
  SCHEMA_TAB_FORM_VALIDATION_KEY_MAP.schemaDetails as unknown as string[],
);

/**
 *
 * @param name - The name to get the root of.
 * @returns The root of the name.
 * @example
 * getFieldNameRoot(['name']) // 'name'
 * getFieldNameRoot('name.sub') // 'name'
 */
const getFieldNameRoot = (name: unknown): string | undefined => {
  if (Array.isArray(name) && name.length > 0) {
    return String(name[0]);
  }
  if (typeof name === 'string') {
    return name.includes('.') ? name.slice(0, name.indexOf('.')) : name;
  }
  return undefined;
};

/**
 *
 * @param into - The array to push the message into.
 * @param message - The message to push.
 * @returns The array with the message pushed.
 * @example
 * pushUniqueMessage(['a', 'b', 'c'], 'd') // ['a', 'b', 'c', 'd']
 * pushUniqueMessage(['a', 'b', 'c'], 'a') // ['a', 'b', 'c']
 * pushUniqueMessage(['a', 'b', 'c'], 'd') // ['a', 'b', 'c', 'd']
 * @returns
 */
const pushUniqueMessage = (into: string[], message: string) => {
  if (!message || into.includes(message)) return;
  into.push(message);
};

/**
 * Surface import-time row failures on the Uploaded Columns tab (not only rc-field-form).
 * @param tabErrors - The tab errors to merge the invalid into.
 * @param invalidUploaded - The invalid uploaded to merge.
 * @returns The merged tab errors.
 * @example
 * mergeImportInvalidIntoUploadedTab({ uploadedColumns: ['a', 'b', 'c'] }, [{ error: { issues: [{ message: 'd' }] } }]) // { uploadedColumns: ['a', 'b', 'c', 'd'] }
 */
export const mergeImportInvalidIntoUploadedTab = (
  tabErrors: SchemaFormValidationErrors,
  invalidUploaded: InvalidColumns[],
): SchemaFormValidationErrors => {
  if (invalidUploaded.length === 0) return tabErrors;
  const uploaded = [...tabErrors.uploadedColumns];
  for (const inv of invalidUploaded) {
    for (const issue of inv.error.issues) {
      pushUniqueMessage(uploaded, issue.message);
    }
  }
  return { ...tabErrors, uploadedColumns: uploaded };
};

/**
 * Bucket rc-field-form errors by top-level path for tab labels.
 * @param fieldErrors - The field errors to transform.
 * @returns The transformed field errors.
 * @example
 * transformFieldErrorsToTabErrors([{ name: 'name', errors: ['d'] }]) // { schemaDetails: ['d'], uploadedColumns: [], schemaColumns: [], formSchemaControls: [] }
 */
export const transformFieldErrorsToTabErrors = (
  fieldErrors: FieldError[],
): SchemaFormValidationErrors => {
  const schemaDetails: string[] = [];
  const uploadedColumns: string[] = [];
  const schemaColumns: string[] = [];
  const formSchemaControls: string[] = [];

  for (const fe of fieldErrors) {
    const first = fe.errors?.[0];
    if (first === undefined || first === null) continue;
    const message = String(first).trim();
    if (!message) continue;
    const root = getFieldNameRoot(fe.name);
    if (root === undefined) continue;

    if (SCHEMA_DETAILS_KEY_SET.has(root)) {
      pushUniqueMessage(schemaDetails, message);
    } else if (root === 'uploadedColumns' || root === 'invalidColumns') {
      pushUniqueMessage(uploadedColumns, message);
    } else if (root === 'schemaColumns') {
      pushUniqueMessage(schemaColumns, message);
    } else if (root === 'uploadType' || root === 'file') {
      pushUniqueMessage(formSchemaControls, message);
    }
  }

  return {
    schemaDetails,
    uploadedColumns,
    schemaColumns,
    formSchemaControls,
  };
};
