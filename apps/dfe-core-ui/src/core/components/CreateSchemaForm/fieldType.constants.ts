/** Column `_field_type` values used in create-schema forms. */
export const SCHEMA_FIELD_TYPES = Object.freeze({
  USER_DEFINED: 'user_defined',
  CSV_IMPORT: 'csv_imported',
  BASE: 'base',
  PROMOTED: 'promoted',
  ELASTIC_IMPORT: 'elastic_imported',
});

export const COLUMN_LIST_USER_EDITABLE_KEYS = [
  'name',
  'type',
  'use_case',
  'attribute',
  'expr',
  'comment',
] as const;
