/** Schema and column names, which the engine does not restrict to this set. */
export const DB_NAME_VALIDATOR = {
  regex: /^[a-zA-Z0-9_]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, and underscores`,
};

/** The longest account, group, API key, role, rule or hunt name the engine takes (openapi.json maxLength). */
const MAX_NAME_LENGTH = 128;

const COPY_SUFFIX = '_copy';

/** `base` trimmed so `base` plus the copy suffix stays within MAX_NAME_LENGTH. */
const withCopySuffix = (base: string) =>
  `${base.slice(0, MAX_NAME_LENGTH - COPY_SUFFIX.length)}${COPY_SUFFIX}`;

/** The engine's account, group, API key, OIDC provider and role name rule (openapi.json CreateGroupRequest.name and siblings). */
export const STORE_NAME_VALIDATOR = {
  regex: new RegExp(`^[a-zA-Z0-9][a-zA-Z0-9._-]{0,${MAX_NAME_LENGTH - 1}}$`),
  message: (fieldName: string = 'Name') =>
    `${fieldName} must start with a letter or number, contain only letters, numbers, dots, underscores and hyphens, and be at most ${MAX_NAME_LENGTH} characters`,
  /** A default name for a copy of `name` that this rule accepts, whatever `name` holds. */
  copyName: (name: string) => {
    const base = name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^[^a-zA-Z0-9]+/, '');
    return base ? withCopySuffix(base) : 'copy';
  },
};

/** The engine's organisation name rule (openapi.json CreateOrgRequest.name). */
export const ORG_NAME_VALIDATOR = {
  regex: /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must start with a letter or number and contain only letters, numbers, dots, underscores and hyphens`,
};

/** The engine's rule and hunt name rule (openapi.json RuleCreateRequest.name and HuntCreateRequest.name). */
export const RULE_HUNT_NAME_VALIDATOR = {
  regex: new RegExp(`^[A-Za-z0-9_-]{1,${MAX_NAME_LENGTH}}$`),
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, underscores and hyphens, and be at most ${MAX_NAME_LENGTH} characters`,
  /** A default name for a copy of `name` that this rule accepts, whatever `name` holds. */
  copyName: (name: string) =>
    withCopySuffix(name.replace(/[^A-Za-z0-9_-]/g, '_')),
};

/** The engine's gitops resource name rule (dfe-engine gitcrud/commit_policy.py validate_name). */
export const GITOPS_NAME_VALIDATOR = {
  regex: /^(?!.*\.\.)[A-Za-z0-9._-]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, dots, underscores and hyphens, with no two dots in a row`,
};

/** The engine's library group and tag rule (dfe-engine appmgmt/library.py validate_token). */
export const LIBRARY_TOKEN_VALIDATOR = {
  regex: /^[A-Za-z0-9][A-Za-z0-9._/-]*$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must start with a letter or number and contain only letters, numbers, dots, underscores, hyphens and slashes`,
};

/** The engine's app file name rule, before its suffix check (dfe-engine appmgmt/files.py validate_filename). */
export const APP_FILENAME_VALIDATOR = {
  regex: /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._-]*$/,
  message: (fieldName: string = 'Filename') =>
    `${fieldName} must start with a letter or number and contain only letters, numbers, dots, underscores and hyphens, with no two dots in a row`,
};

/** The engine's alert destination name rule (dfe-engine hunts/alert.py is_destination_name). */
export const DESTINATION_NAME_VALIDATOR = {
  regex: /^(?!\.{1,2}$)[^/\\\0]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must be one file name: not "." or "..", with no slashes or backslashes`,
};

/** The engine's field map standard rule, applied after it lowercases (dfe-engine fieldmap/models.py). */
export const FIELD_MAP_STANDARD_VALIDATOR = {
  regex: /^[A-Za-z][A-Za-z0-9_]*$/,
  message: (fieldName: string = 'Standard') =>
    `${fieldName} must start with a letter and contain only letters, numbers and underscores`,
};

/** The engine's env var name rule (dfe-engine auth/oidc/credential_env.py). */
export const ENV_VAR_NAME_VALIDATOR = {
  regex: /^[A-Za-z_][A-Za-z0-9_]*$/,
  message:
    'Enter an environment variable name such as OKTA_CLIENT_SECRET, not the value itself',
};
