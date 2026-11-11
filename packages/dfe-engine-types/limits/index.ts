// Generated from the limits the engine publishes in specs/openapi.json. Do not edit.

/** How deep all and any groups may nest in one match. */
export const MATCH_NESTING_LIMIT = 4;

/** The operators a source form offers: the engine's, less the ones it reserves. */
export const MATCH_OPERATORS = [
  'equals',
  'exists',
  'includes',
  'starts_with',
  'ends_with',
  'not_equals',
] as const;

/** What a pipeline credential reference starts with, which is where it is kept. */
export const CREDENTIAL_REFERENCE_PREFIXES = [
  'vault:',
  'bao:',
  'openbao:',
  'env:',
  'file:',
] as const;
