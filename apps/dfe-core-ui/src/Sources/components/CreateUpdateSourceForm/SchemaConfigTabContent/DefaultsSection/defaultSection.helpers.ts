import { TSystemDefaults } from '@/core/hooks/useFetchSystemDefaults/types';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';

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
  formValues: CreateUpdateSourceFormData;
  defaults: TSystemDefaults | null | undefined;
}) => {
  const {
    default_header_type,
    default_header_version,
    default_ttl_days,
    default_engine,
  } = defaults ?? {};
  const { header: { type, version } = {}, schema: { ttl_days, engine } = {} } =
    formValues;

  console.log({
    type,
    version,
    ttl_days,
    engine,
  });
  console.log({
    default_header_type,
    default_header_version,
    default_ttl_days,
    default_engine,
  });
  const hasOverride =
    type !== default_header_type ||
    version !== default_header_version ||
    ttl_days !== default_ttl_days ||
    engine !== default_engine;

  console.log({ hasOverride });

  return (
    type !== default_header_type ||
    version !== default_header_version ||
    ttl_days !== default_ttl_days ||
    engine !== default_engine
  );
};
