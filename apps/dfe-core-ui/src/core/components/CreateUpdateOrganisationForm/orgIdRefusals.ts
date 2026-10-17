import { getApiErrorResponseBody } from '@/core/config/api/client';

/** The engine's code for an organisation ID a hunt still reads for another organisation. */
export const TENANT_ID_HELD_CODE = 'tenant_id_held';

export const ORG_IDS_FIELD = 'org_ids';

/** A hunt reading some of the submitted organisation IDs for another organisation. */
export type HeldOrgIds = {
  hunt: string;
  org: string;
  orgIds: string[];
  /** The review branch that gives the hunt those IDs once it merges, empty on main. */
  branch: string;
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isHeldEntry = (
  entry: unknown,
): entry is {
  hunt: string;
  org: string;
  tenant_ids: string[];
  branch?: unknown;
} =>
  typeof entry === 'object' &&
  entry !== null &&
  'hunt' in entry &&
  typeof entry.hunt === 'string' &&
  'org' in entry &&
  typeof entry.org === 'string' &&
  'tenant_ids' in entry &&
  isStringArray(entry.tenant_ids);

/** Every hunt a `tenant_id_held` refusal names, and none for any other failure. */
export const getHeldOrgIds = (error: unknown): HeldOrgIds[] => {
  const body = getApiErrorResponseBody(error);
  const held = body?.code === TENANT_ID_HELD_CODE ? body.context?.held : null;
  if (!Array.isArray(held)) return [];
  return held.filter(isHeldEntry).map((entry) => ({
    hunt: entry.hunt,
    org: entry.org,
    orgIds: entry.tenant_ids,
    branch: typeof entry.branch === 'string' ? entry.branch : '',
  }));
};

const isOrgIdsField = (field?: string) =>
  field === ORG_IDS_FIELD || !!field?.startsWith(`${ORG_IDS_FIELD}.`);

/** Whether the engine refused the submit for its organisation IDs alone. */
export const isOrgIdsRefusal = (error: unknown): boolean => {
  const errors = getApiErrorResponseBody(error)?.errors ?? [];
  return errors.length > 0 && errors.every((e) => isOrgIdsField(e.field));
};

/**
 * Each refused organisation ID in the console's words, for the field.
 *
 * The engine names a refused ID by its index in `org_ids` and words the
 * refusal as the pattern it failed.
 */
export const getRefusedOrgIdMessages = (
  error: unknown,
  orgIds: readonly string[] = [],
): string[] =>
  (getApiErrorResponseBody(error)?.errors ?? [])
    .filter((e) => isOrgIdsField(e.field))
    .map((e) => {
      const id = orgIds[Number(e.field?.split('.')[1])];
      return e.code === 'string_pattern_mismatch' && id !== undefined
        ? `Organisation ID ${JSON.stringify(id)} may not be blank, hold a comma or a control character such as a tab, or start or end with a space`
        : e.message;
    });
