import { TTableEngine } from '@/core/hooks/useFetchTableEngines/types';
import { cn } from '@/core/utils/style';
import { Input, Select, SelectProps } from 'antd';

/* import-scope-drift-disable - (exported for tests) */
/** An engine string split into its variant and the text inside its parentheses. */
export const splitEngine = (engine: string | null | undefined) => {
  const value = engine ?? '';
  const open = value.indexOf('(');
  if (open < 0) {
    return { variant: value.trim(), args: '' };
  }
  const close = value.lastIndexOf(')');
  return {
    variant: value.slice(0, open).trim(),
    args: value.slice(open + 1, close > open ? close : undefined),
  };
};
/* import-scope-drift-enable */

/* import-scope-drift-disable - (exported for tests) */
/** The engine string the API stores; a blank variant is blank so the DFE default applies. */
export const composeEngine = (variant: string, args: string) => {
  if (!variant) {
    return undefined;
  }
  return args.trim() ? `${variant}(${args})` : variant;
};
/* import-scope-drift-enable */

/** The error for an engine that breaks its variant's argument rule, if it does. */
export const engineArgumentsError = (
  engine: string | null | undefined,
  engines: TTableEngine[],
) => {
  const { variant, args } = splitEngine(engine);
  const option = engines.find(({ name }) => name === variant);
  if (!option) {
    return undefined;
  }
  if (option.arguments === 'required' && !args.trim()) {
    return `${variant} requires arguments: ${option.argument_hint}`;
  }
  if (option.arguments === 'none' && args.trim()) {
    return `${variant} takes no arguments`;
  }
  return undefined;
};

interface TableEngineInputProps extends SelectProps {
  engines: TTableEngine[];
  loading: boolean;
  placeholder?: string;
}

/**
 * A table engine picked from the registry, plus its arguments when the variant takes them.
 *
 * With no registry to offer (an engine that predates the endpoint), it falls back to free text.
 */

export const TableEngineInput = ({
  id,
  value,
  onChange,
  engines,
  loading,
  placeholder,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  className,
  size,
  ...props
}: TableEngineInputProps) => {
  // The error is about the field, and either box may be the one to fix.
  const fieldAria = {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  };

  if (!loading && engines.length === 0) {
    return (
      <Input
        size={size}
        className={className}
        id={id}
        {...fieldAria}
        aria-required={ariaRequired}
        allowClear
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={(event) => onChange?.(event.target.value || undefined)}
      />
    );
  }

  const { variant, args } = splitEngine(value);
  const selected = engines.find(({ name }) => name === variant);
  // Stored arguments stay editable even on a variant that takes none, so they can be removed.
  const showArguments =
    (!!selected && selected.arguments !== 'none') || args.trim() !== '';
  const argumentsPlaceholder = selected?.argument_hint
    ? `${selected.argument_hint} (${selected.arguments})`
    : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Select
        {...props}
        size={size}
        id={id}
        {...fieldAria}
        aria-required={ariaRequired}
        allowClear
        showSearch
        loading={loading}
        placeholder={placeholder}
        value={variant || undefined}
        onChange={(next?: string) => onChange?.(composeEngine(next ?? '', ''))}
        options={engines.map(({ name, description }) => ({
          value: name,
          label: name,
          title: description,
        }))}
      />
      {showArguments && (
        <Input
          {...fieldAria}
          size={size}
          aria-label={`${variant} arguments`}
          placeholder={argumentsPlaceholder}
          value={args}
          onChange={(event) =>
            onChange?.(composeEngine(variant, event.target.value))
          }
        />
      )}
    </div>
  );
};
