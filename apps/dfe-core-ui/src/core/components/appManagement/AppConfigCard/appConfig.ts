import { TAppConfigField } from '@/core/hooks/apps/config/useFetchAppConfig/types';
import { getApiErrorResponseBody } from '@/core/config/api/client';

/** The overlay root every contract option is addressed under. */
export const CONFIG_ROOT = 'config';

/** The overlay root a custom environment key is addressed under. */
export const ENV_ROOT = 'extraEnv';

/** Options whose path carries no group of its own collect here. */
export const GENERAL_SECTION = 'general';

/** An environment name: upper case, digits and underscores, starting alpha. */
export const ENV_NAME = /^[A-Z][A-Z0-9_]*$/;

export type TConfigSection = {
  name: string;
  fields: TAppConfigField[];
};

export type TParsed =
  | { ok: true; value: unknown }
  | { ok: false; reason: string };

export type TFieldError = { path: string; message: string };

/**
 * The group an option belongs to, taken from its own path.
 *
 * The contract declares no section of its own, so the path is the only grouping
 * the engine actually ships - `config.kafka.brokers` belongs with the rest of
 * `kafka`. A single-segment option has no group and collects under general.
 */
export const sectionNameFor = (path: string): string => {
  const rooted = path.startsWith(`${CONFIG_ROOT}.`)
    ? path.slice(CONFIG_ROOT.length + 1)
    : path;
  const segments = rooted.split('.');
  return segments.length > 1 && segments[0] ? segments[0] : GENERAL_SECTION;
};

/** Every option, grouped by its path's own section, each group path-sorted. */
export const groupFields = (
  fields: readonly TAppConfigField[],
): TConfigSection[] => {
  const sections = new Map<string, TAppConfigField[]>();
  for (const field of fields) {
    const name = sectionNameFor(field.path);
    const existing = sections.get(name);
    if (existing) {
      existing.push(field);
    } else {
      sections.set(name, [field]);
    }
  }
  return [...sections.entries()]
    .map(([name, grouped]) => ({
      name,
      fields: [...grouped].sort((a, b) => a.path.localeCompare(b.path)),
    }))
    .sort((a, b) => {
      // General is the catch-all, so it reads last rather than alphabetically.
      if (a.name === GENERAL_SECTION) return 1;
      if (b.name === GENERAL_SECTION) return -1;
      return a.name.localeCompare(b.name);
    });
};

/** An option the operator has overridden, as opposed to one running a default. */
export const isOverride = (field: TAppConfigField): boolean =>
  field.provenance === 'overlay';

/** An option the deployment derives elsewhere, which a write cannot change. */
export const isChartSet = (field: TAppConfigField): boolean =>
  field.provenance === 'chart';

/** A structured option is edited as JSON, because no single input carries one. */
export const isStructured = (type: string): boolean =>
  type === 'array' || type === 'object';

/** The label an option reads under: its own title, else its last path segment. */
export const fieldLabel = (field: TAppConfigField): string => {
  if (field.title) return field.title;
  const segments = field.path.split('.');
  return segments[segments.length - 1] ?? field.path;
};

/**
 * What an unset option shows in its box.
 *
 * Grey placeholder text, never a value: the box has to stay empty so that
 * leaving it alone submits nothing. A secret never shows a default at all,
 * because the engine does not return one.
 */
export const placeholderFor = (field: TAppConfigField): string => {
  if (field.secret) return 'unset';
  if (isChartSet(field)) return 'set by the deployment';
  if (field.default === null || field.default === undefined) return 'unset';
  return isStructured(field.type)
    ? JSON.stringify(field.default)
    : String(field.default);
};

/** Parse a structured option's JSON, reporting why rather than throwing. */
export const parseStructured = (raw: string): TParsed => {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (cause) {
    return {
      ok: false,
      reason: cause instanceof Error ? cause.message : 'not valid JSON',
    };
  }
};

/** An enum renders as strings, so a submit maps the choice back to its member. */
const enumMemberFor = (field: TAppConfigField, value: unknown): unknown => {
  if (!field.enum) return value;
  const match = field.enum.find((member) => String(member) === String(value));
  return match === undefined ? value : match;
};

export type TBuildResult =
  | { ok: true; changes: Record<string, unknown> }
  | { ok: false; path: string; reason: string };

/**
 * The write body, built from the edit map alone.
 *
 * Only a path the operator actually edited is in `drafts`, so an option left
 * alone cannot reach the payload - which is what stops a default rendered as
 * placeholder text from being committed as an override the moment someone
 * opens the page. A null is kept, because that is how a custom environment key
 * is removed.
 */
export const buildChanges = (
  drafts: Record<string, unknown>,
  fieldsByPath: ReadonlyMap<string, TAppConfigField>,
): TBuildResult => {
  const changes: Record<string, unknown> = {};
  for (const [path, draft] of Object.entries(drafts)) {
    if (draft === undefined) continue;
    const field = fieldsByPath.get(path);
    if (field && isStructured(field.type) && typeof draft === 'string') {
      const parsed = parseStructured(draft);
      if (!parsed.ok) return { ok: false, path, reason: parsed.reason };
      changes[path] = parsed.value;
      continue;
    }
    changes[path] = field ? enumMemberFor(field, draft) : draft;
  }
  return { ok: true, changes };
};

/**
 * The option a refused write names, so the reason lands on the box that caused
 * it rather than at the bottom of the card.
 *
 * The engine refuses with `{code, path, message}`; its handler moves everything
 * outside code and message into `context`, so the path arrives there and
 * `errors[]` stays empty. Reading `errors[]` alone loses the field entirely.
 */
export const fieldErrorFrom = (error: unknown): TFieldError | null => {
  const body = getApiErrorResponseBody(error);
  if (!body) return null;
  const path = body.context?.path;
  if (typeof path !== 'string' || !path) return null;
  return { path, message: body.message };
};
