import { ApiError, getApiErrorResponseBody } from '@/core/config/api/client';
import { components } from '@repo/dfe-engine-types';

export type TRuleError = components['schemas']['RuleError'];

const isString = (value: unknown): value is string => typeof value === 'string';

const bodyOf = (error: unknown, status: number) =>
  error instanceof ApiError && error.status === status
    ? getApiErrorResponseBody(error)
    : null;

/** A reorder naming other blocks than the field has now, with the list it has. */
export type TOrderConflict = { message: string; blocks: string[] };

export const getOrderConflict = (error: unknown): TOrderConflict | null => {
  const body = bodyOf(error, 409);
  if (body?.code !== 'order_conflict') return null;
  const blocks = body.context?.blocks;
  return {
    message: body.message,
    blocks: Array.isArray(blocks) ? blocks.filter(isString) : [],
  };
};

/** A guarded write refused because the revision it was read at has moved. */
export type TStaleRevision = { message: string; etag: string | null };

export const getStaleRevision = (error: unknown): TStaleRevision | null => {
  if (!(error instanceof ApiError) || error.status !== 412) return null;
  // A proxy can answer 412 with no body, and the revision still moved.
  const body = getApiErrorResponseBody(error);
  const etag = body?.context?.etag;
  return {
    message: body?.message ?? 'The revision this page read has changed',
    etag: isString(etag) ? etag : null,
  };
};

/** A guarded write sent with no revision at all. */
export const isMissingRevision = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 428;

/** Every reason the receiver would refuse a source's rule, each with its span. */
export const getRuleErrors = (error: unknown): TRuleError[] => {
  const body = bodyOf(error, 422);
  if (body?.code !== 'invalid_rule') return [];
  const ruleErrors = body.context?.rule_errors;
  if (!Array.isArray(ruleErrors)) return [];
  return ruleErrors.filter(
    (entry): entry is TRuleError =>
      typeof entry === 'object' &&
      entry !== null &&
      isString((entry as TRuleError).field) &&
      isString((entry as TRuleError).message),
  );
};

/** An alias another enabled source already claims under the same profile. */
export type TAliasConflict = {
  message: string;
  profile: string;
  alias: string;
  conflictingSource: string;
};

export const getAliasConflict = (error: unknown): TAliasConflict | null => {
  const body = bodyOf(error, 409);
  if (body?.code !== 'alias_conflict') return null;
  const { profile, alias, conflicting_source } = body.context ?? {};
  if (!isString(profile) || !isString(alias)) return null;
  return {
    message: body.message,
    profile,
    alias,
    conflictingSource: isString(conflicting_source) ? conflicting_source : '',
  };
};

/** A preview the engine cannot filter to this source's records until its own table exists. */
export const isMatchNotSampleable = (error: unknown): boolean =>
  bodyOf(error, 422)?.code === 'match_not_sampleable';
