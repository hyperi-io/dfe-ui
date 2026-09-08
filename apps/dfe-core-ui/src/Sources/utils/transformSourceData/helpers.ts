import yaml from 'yaml';

export type ObjectArrayFormEntries =
  | { key: string; value: string }[]
  | undefined;

export const objectArrayToObject = (
  entries: ObjectArrayFormEntries,
): Record<string, string> | undefined => {
  if (!entries?.length) {
    return undefined;
  }
  return entries.reduce(
    (acc, { key, value }) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const objectToObjectArray = (
  record: Record<string, string> | null | undefined,
): ObjectArrayFormEntries => {
  if (!record || Object.keys(record).length === 0) {
    return undefined;
  }
  return Object.entries(record).map(([key, value]) => ({ key, value }));
};

export type FetcherConfig = Record<string, unknown>;

export type FetcherConfigParseResult =
  | { ok: true; config: FetcherConfig }
  | { ok: false; message: string };

/** The engine sets these two on the deployed stanza, so a hand-set one is a 422. */
export const ENGINE_OWNED_FETCHER_KEYS = ['enabled', 'topic'] as const;

/**
 * The fetcher stanza is an object on the API and YAML text in the form.
 *
 * Empty text is an empty stanza, not an error: a fetcher family with no
 * options of its own is a valid source.
 */
export const parseFetcherConfig = (
  text?: string | null,
): FetcherConfigParseResult => {
  if (!text?.trim()) {
    return { ok: true, config: {} };
  }

  let parsed: unknown;
  try {
    parsed = yaml.parse(text);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Config is not YAML',
    };
  }

  if (parsed == null) {
    return { ok: true, config: {} };
  }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, message: 'Config must be a YAML mapping of keys' };
  }
  return { ok: true, config: parsed as FetcherConfig };
};

export const stringifyFetcherConfig = (
  config?: FetcherConfig | null,
): string =>
  config && Object.keys(config).length > 0
    ? yaml.stringify(config, { indent: 2, lineWidth: 0 })
    : '';
