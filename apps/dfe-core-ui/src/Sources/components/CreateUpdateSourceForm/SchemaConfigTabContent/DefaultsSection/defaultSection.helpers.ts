import { TSystemDefaults } from '@/core/hooks/useFetchSystemDefaults/types';

export type DefaultsFormValues = {
  header?: { type?: string | null; version?: string | null };
  schema?: { ttl_days?: number | null; engine?: string | null };
};

export type DefaultsFormPatch = {
  header?: { type?: string; version?: string };
  schema?: { ttl_days?: number; engine?: string };
};

export const isDefaultOveridden = (
  initialValue: string | number | null | undefined,
  defaultValue: string | number | null | undefined,
) => {
  if (
    initialValue === undefined ||
    initialValue === null ||
    initialValue === ''
  ) {
    return false;
  }
  return String(initialValue) !== String(defaultValue);
};

/**
 * Build a setFieldsValue patch for fields that are still unset (`undefined`).
 * `null` and `''` are intentional "follow system default" values on edit and
 * must not be overwritten.
 */
export const buildUnsetDefaultsPatch = (
  formValues: DefaultsFormValues,
  defaults: TSystemDefaults,
): DefaultsFormPatch => {
  const header: NonNullable<DefaultsFormPatch['header']> = {};
  const schema: NonNullable<DefaultsFormPatch['schema']> = {};

  if (formValues.header?.type === undefined) {
    header.type = defaults.default_header_type;
  }
  if (formValues.header?.version === undefined) {
    header.version = defaults.default_header_version;
  }
  if (
    formValues.schema?.ttl_days === undefined &&
    defaults.default_ttl_days !== undefined
  ) {
    schema.ttl_days = defaults.default_ttl_days;
  }
  if (formValues.schema?.engine === undefined) {
    schema.engine = defaults.default_engine;
  }

  const patch: DefaultsFormPatch = {};
  if (Object.keys(header).length > 0) {
    patch.header = header;
  }
  if (Object.keys(schema).length > 0) {
    patch.schema = schema;
  }
  return patch;
};

export const hasOverrides = ({
  formValues,
  defaults,
}: {
  formValues: DefaultsFormValues;
  defaults: TSystemDefaults | null | undefined;
}) => {
  if (!defaults) {
    return false;
  }

  const {
    default_header_type,
    default_header_version,
    default_ttl_days,
    default_engine,
  } = defaults;
  const { header: { type, version } = {}, schema: { ttl_days, engine } = {} } =
    formValues;

  return (
    isDefaultOveridden(type, default_header_type) ||
    isDefaultOveridden(version, default_header_version) ||
    isDefaultOveridden(ttl_days, default_ttl_days) ||
    isDefaultOveridden(engine, default_engine)
  );
};
