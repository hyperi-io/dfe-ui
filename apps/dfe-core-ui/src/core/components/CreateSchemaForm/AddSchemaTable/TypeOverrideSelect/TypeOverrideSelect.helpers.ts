import {
  ADVANCED_OPTIONS_MAP,
  TransformFunctionParams,
} from '@/core/components/CreateSchemaForm/AddSchemaTable/fieldOptions.constants';

export const validateOverride = (
  override: string | null,
  options: TransformFunctionParams,
): string | null => {
  if (!override) return null;

  switch (override) {
    case 'Decimal':
      if (options.precision === undefined || options.scale === undefined) {
        return 'Precision and scale are required';
      }
      return null;
    case 'Decimal64':
      if (options.scale === undefined) {
        return 'Scale is required';
      }
      return null;
    case 'DateTime64':
      if (options.precision === undefined) {
        return 'Precision is required';
      }
      return null;
    case 'FixedString':
      if (options.length === undefined) {
        return 'Length is required';
      }
      return null;
    case 'Enum16':
      if (options.values === undefined) {
        return 'Values are required';
      }
      return null;
    default:
      return null;
  }
};

export const transformOverride = (
  overrideType: string | null,
  advancedOptions: TransformFunctionParams,
): string | null => {
  if (!overrideType) return null;

  const option = ADVANCED_OPTIONS_MAP[overrideType];
  if (!option) return null;

  return option.transformFunction?.(advancedOptions) ?? overrideType;
};

export const getInitialOverrideType = (value: string | null) => {
  if (!value) return null;
  return value.split('(')[0].trim();
};

export const getInitialAdvancedOptions = (
  value: string | null,
): TransformFunctionParams => {
  const overrideType = getInitialOverrideType(value);
  if (!overrideType) return {};

  const advancedOptions = value?.replace(')', '').split('(')[1];
  const parseNum = (raw: string | undefined) => {
    const parsed = parseInt(raw?.trim() ?? '0', 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  switch (overrideType) {
    case 'Decimal': {
      const [precision, scale] = (advancedOptions ?? '').split(',');
      return {
        precision: parseNum(precision),
        scale: parseNum(scale),
      };
    }
    case 'Decimal64':
      return {
        scale: parseNum(advancedOptions),
      };
    case 'DateTime64':
      return {
        precision: parseNum(advancedOptions?.split(',')[0]),
      };
    case 'FixedString':
      return {
        length: parseNum(advancedOptions?.split(',')[0]),
      };
    case 'Enum16':
      return {
        values: advancedOptions?.trim(),
      };
    default:
      return {};
  }
};
