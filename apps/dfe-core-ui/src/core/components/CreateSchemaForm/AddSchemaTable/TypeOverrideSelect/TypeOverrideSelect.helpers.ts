import type { TransformFunctionParams } from '@/core/components/CreateSchemaForm/AddSchemaTable/fieldOptions.constants';
import type { TSchemaVocabularyChOverride } from '@/core/hooks/useFetchSchemaVocabulary/types';

type OverrideOptions = TSchemaVocabularyChOverride[];

const findOption = (
  override: string | null,
  options: OverrideOptions,
): TSchemaVocabularyChOverride | undefined =>
  options.find((option) => option.value === override);

export const validateOverride = (
  override: string | null,
  params: TransformFunctionParams,
  options: OverrideOptions,
): string | null => {
  if (!override) return null;

  const missing = (findOption(override, options)?.parameters ?? []).filter(
    ({ name }) => params[name] === undefined,
  );
  if (missing.length === 0) return null;

  // A label such as `Values (comma separated)` names its input, so only the noun is used.
  const [first, ...rest] = missing.map(({ label }) => label.split(' (')[0]);
  const names = [first, ...rest.map((label) => label.toLowerCase())];
  return `${names.join(' and ')} required`;
};

export const transformOverride = (
  overrideType: string | null,
  params: TransformFunctionParams,
  options: OverrideOptions,
): string | null => {
  if (!overrideType) return null;

  const option = findOption(overrideType, options);
  if (!option) return null;

  return (
    option.template?.replace(/\{(\w+)\}/g, (_, name: string) =>
      String(params[name] ?? ''),
    ) ?? option.value
  );
};

/**
 * The override type a stored value belongs to. A value that is an option whole,
 * such as `Array(String)`, is that option. Any other has its arguments dropped,
 * so `Decimal(10, 2)` is `Decimal`.
 */
export const getInitialOverrideType = (
  value: string | null,
  options: OverrideOptions = [],
) => {
  if (!value) return null;
  if (findOption(value, options)) return value;
  return value.split('(')[0].trim();
};

const parseNum = (raw: string | undefined) => {
  const parsed = parseInt(raw?.trim() ?? '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * The parameter values inside a stored override such as `Decimal(18, 4)`.
 *
 * Arguments are split on commas, and the last parameter takes whatever is left,
 * so a text parameter may hold commas of its own. An integer reads as far as its
 * first non-digit, which is how `3` comes out of `3, 'UTC'`.
 */
export const getInitialAdvancedOptions = (
  value: string | null,
  options: OverrideOptions = [],
): TransformFunctionParams => {
  const option = findOption(getInitialOverrideType(value, options), options);
  if (!value || !option || option.parameters.length === 0) return {};

  const inner = value.slice(
    value.indexOf('(') + 1,
    value.lastIndexOf(')') === -1 ? undefined : value.lastIndexOf(')'),
  );
  const pieces = inner.split(',');
  const last = option.parameters.length - 1;

  return Object.fromEntries(
    option.parameters.map(({ name, kind }, index) => {
      const raw = (
        index === last ? pieces.slice(index).join(',') : (pieces[index] ?? '')
      ).trim();
      return [name, kind === 'integer' ? parseNum(raw) : raw];
    }),
  );
};
