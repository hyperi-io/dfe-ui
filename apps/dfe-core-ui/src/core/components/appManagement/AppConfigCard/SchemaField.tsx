'use client';

import { TAppConfigField } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { IconLock } from '@repo/dfe-icons';
import { Input, InputNumber, Select, Switch, Tag, Tooltip } from 'antd';
import {
  fieldLabel,
  isChartSet,
  isOverride,
  isStructured,
  placeholderFor,
} from './appConfig';

export const OVERRIDE_LABEL = 'override';
export const CHART_LABEL = 'set by the deployment';
export const DEFAULT_LABEL = 'default';
export const UNSET_LABEL = 'unset';

const inputIdFor = (path: string) => `app-config-${path.replace(/\./g, '-')}`;

/** A structured option round-trips as JSON, so that is what the box holds. */
const asText = (value: unknown, type: string): string => {
  if (value === null || value === undefined) return '';
  if (isStructured(type)) return JSON.stringify(value, null, 2);
  return String(value);
};

/**
 * Where this option's value comes from, as its own visible state.
 *
 * `chart` is not a default and not a blank box: the deployment derives it from
 * something else and the write would not change it, so folding it into either
 * tells the operator the wrong story about where the value came from.
 */
const Provenance = ({ field }: { field: TAppConfigField }) => {
  if (isOverride(field)) {
    return (
      <Tag color="blue" variant="filled">
        {OVERRIDE_LABEL}
      </Tag>
    );
  }
  if (isChartSet(field)) {
    return (
      <Tooltip title="The deployment derives this value, and it is rendered after the overlay, so a write here would not change it.">
        <Tag color="purple" variant="filled">
          {CHART_LABEL}
        </Tag>
      </Tooltip>
    );
  }
  // Driven off provenance, not `set`: an option running the app's own default
  // has nothing in the overlay, so `set` is false for it too, and reading that
  // instead would label every defaulted option as unset.
  return (
    <Tag variant="filled">
      {field.provenance === 'default' ? DEFAULT_LABEL : UNSET_LABEL}
    </Tag>
  );
};

/**
 * One contract option, rendered over its declared type.
 *
 * An untouched option holds no draft at all - its box is empty and its default
 * shows as placeholder text - which is what keeps the default out of the
 * submitted payload. A draft of `undefined` means untouched, and only a real
 * edit replaces it.
 */
export const SchemaField = ({
  field,
  draft,
  onChange,
  errorMessage,
}: {
  field: TAppConfigField;
  draft?: unknown;
  onChange: (value: unknown) => void;
  errorMessage?: string;
}) => {
  const touched = draft !== undefined;
  const override = isOverride(field);
  const chartSet = isChartSet(field);
  // A secret's value never comes back, so the box starts empty even when set.
  const backing = override && !field.secret ? field.value : undefined;
  const current = touched ? draft : backing;
  const inputId = inputIdFor(field.path);
  const label = fieldLabel(field);

  const control = () => {
    if (field.enum && field.enum.length > 0) {
      return (
        <Select
          id={inputId}
          className="w-full"
          disabled={chartSet}
          allowClear
          placeholder={placeholderFor(field)}
          value={current === undefined || current === null ? undefined : String(current)}
          onChange={(next) => onChange(next)}
          options={field.enum.map((option) => ({
            label: String(option),
            value: String(option),
          }))}
        />
      );
    }
    if (field.type === 'boolean') {
      return (
        <Switch
          id={inputId}
          size="small"
          disabled={chartSet}
          checked={current === true}
          onChange={(next) => onChange(next)}
        />
      );
    }
    if (field.type === 'integer' || field.type === 'number') {
      return (
        <InputNumber
          id={inputId}
          className="w-full"
          disabled={chartSet}
          placeholder={placeholderFor(field)}
          value={typeof current === 'number' ? current : null}
          onChange={(next) => onChange(next ?? undefined)}
        />
      );
    }
    if (isStructured(field.type)) {
      return (
        <Input.TextArea
          id={inputId}
          rows={3}
          disabled={chartSet}
          placeholder={placeholderFor(field)}
          value={asText(current, field.type)}
          onChange={(event) =>
            onChange(event.target.value === '' ? undefined : event.target.value)
          }
        />
      );
    }
    return (
      <Input
        id={inputId}
        disabled={chartSet}
        placeholder={placeholderFor(field)}
        value={asText(current, field.type)}
        onChange={(event) =>
          onChange(event.target.value === '' ? undefined : event.target.value)
        }
      />
    );
  };

  return (
    <div
      role="group"
      aria-label={field.path}
      className="flex flex-col gap-1 py-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="text-sm font-semibold">
          {label}
        </label>
        <Provenance field={field} />
        {field.secret && (
          <Tag variant="filled">{field.set ? 'secret set' : 'secret unset'}</Tag>
        )}
        {field.protected && (
          <Tooltip title="Locked by a governance policy. A holder of the override grant can still change it deliberately.">
            <Tag color="gold" icon={<IconLock className="inline size-3" />}>
              locked
            </Tag>
          </Tooltip>
        )}
      </div>

      {field.description && (
        <p className="text-foreground/60 dark:text-dark-foreground/60 text-xs">
          {field.description}
        </p>
      )}

      {control()}

      <span className="text-foreground/40 dark:text-dark-foreground/40 font-mono text-xs">
        {field.path}
      </span>

      {errorMessage && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
