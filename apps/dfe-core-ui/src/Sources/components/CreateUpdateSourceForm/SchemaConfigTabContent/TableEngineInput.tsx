import { TTableEngine } from '@/Sources/hooks/useFetchTableEngines/types';
import { Input, Select } from 'antd';

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

/** The engine string the API stores; a blank variant is blank so the DFE default applies. */
export const composeEngine = (variant: string, args: string) => {
  if (!variant) {
    return undefined;
  }
  return args.trim() ? `${variant}(${args})` : variant;
};

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
}: {
  id?: string;
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  engines: TTableEngine[];
  loading: boolean;
  placeholder?: string;
}) => {
  if (!loading && engines.length === 0) {
    return (
      <Input
        id={id}
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
    <div className="flex flex-col gap-2">
      <Select
        id={id}
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
