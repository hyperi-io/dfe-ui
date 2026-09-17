import { TSystemDefaults } from '@/core/hooks/useFetchSystemDefaults/types';

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

export const setInitialValue = (
  initialValue: string | number | null | undefined,
  defaultValue: string | number | null | undefined,
) => {
  if (initialValue) {
    return {};
  }
  return { initialValue: defaultValue };
};

export const hasOverrides = ({
  formValues,
  defaults,
}: {
  formValues: {
    header?: { type?: string | null; version?: string | null };
    schema?: { ttl_days?: number | null; engine?: string | null };
  };
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
