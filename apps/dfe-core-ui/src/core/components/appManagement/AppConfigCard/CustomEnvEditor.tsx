'use client';

import { TAppCustomEnv } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { Button, Input, Tag } from 'antd';
import { useState } from 'react';
import { ENV_NAME, ENV_ROOT } from './appConfig';

export const CUSTOM_LABEL = 'custom';
export const ENV_NAME_HINT =
  'Upper case, digits and underscores, starting with a letter.';

export type TEnvRow = { path: string; name: string; value: unknown };

/** Server-held keys first, then the ones added but not yet committed. */
export const envRows = (
  custom: readonly TAppCustomEnv[],
  added: readonly string[],
): TEnvRow[] => [
  ...custom.map((entry) => ({
    path: entry.path,
    name: entry.path.startsWith(`${ENV_ROOT}.`)
      ? entry.path.slice(ENV_ROOT.length + 1)
      : entry.path,
    value: entry.value,
  })),
  ...added.map((name) => ({
    path: `${ENV_ROOT}.${name}`,
    name,
    value: undefined,
  })),
];

/**
 * Environment keys no contract declares, listed apart from the options that do.
 *
 * These are outside every contract on purpose, which is why they sit under
 * their own heading rather than among the declared options. Unlike a contract
 * option, one of these can be removed: the engine deletes the key when the
 * write carries a null for it.
 */
export const CustomEnvEditor = ({
  custom,
  added,
  drafts,
  onSetDraft,
  onAdd,
  onDiscardAdded,
  errorFor,
  disabled,
}: {
  custom: readonly TAppCustomEnv[];
  added: readonly string[];
  drafts: Record<string, unknown>;
  onSetDraft: (path: string, value: unknown) => void;
  onAdd: (name: string) => void;
  onDiscardAdded: (name: string) => void;
  errorFor: (path: string) => string | undefined;
  disabled: boolean;
}) => {
  const [newName, setNewName] = useState('');
  const rows = envRows(custom, added);
  const trimmed = newName.trim().toUpperCase();
  const known = new Set(rows.map((row) => row.name));
  const nameValid = ENV_NAME.test(trimmed) && !known.has(trimmed);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Custom environment</h3>
      <p className="text-foreground/60 dark:text-dark-foreground/60 text-xs">
        Keys the app&apos;s contract does not declare. The deployment refuses a
        name its own chart already sets.
      </p>

      {rows.map((row) => {
        const draft = drafts[row.path];
        const removed = draft === null;
        const shown =
          draft !== undefined && draft !== null ? draft : (row.value ?? '');
        const message = errorFor(row.path);
        return (
          <div key={row.path} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">
                {row.name}
              </span>
              <Tag variant="filled">{CUSTOM_LABEL}</Tag>
              {removed && (
                <Tag color="red" variant="filled">
                  removed on save
                </Tag>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                aria-label={row.path}
                className="w-64"
                disabled={disabled || removed}
                value={String(shown)}
                onChange={(event) =>
                  onSetDraft(
                    row.path,
                    event.target.value === '' ? undefined : event.target.value,
                  )
                }
              />
              {added.includes(row.name) ? (
                <Button
                  size="small"
                  disabled={disabled}
                  onClick={() => onDiscardAdded(row.name)}
                >
                  Discard
                </Button>
              ) : (
                <Button
                  size="small"
                  danger={!removed}
                  disabled={disabled}
                  onClick={() =>
                    onSetDraft(row.path, removed ? undefined : null)
                  }
                >
                  {removed ? 'Keep' : 'Remove'}
                </Button>
              )}
            </div>
            {message && (
              <p
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {message}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-end gap-2">
        <Input
          aria-label="New environment key"
          className="w-64"
          placeholder="NEW_ENV_KEY"
          disabled={disabled}
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <Button
          size="small"
          disabled={disabled || !nameValid}
          onClick={() => {
            onAdd(trimmed);
            setNewName('');
          }}
        >
          Add key
        </Button>
        <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs">
          {ENV_NAME_HINT}
        </span>
      </div>
    </div>
  );
};
