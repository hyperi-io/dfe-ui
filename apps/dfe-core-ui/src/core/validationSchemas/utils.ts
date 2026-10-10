/** Role, schema and column names, which the engine does not restrict to this set. */
export const DB_NAME_VALIDATOR = {
  regex: /^[a-zA-Z0-9_]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, and underscores`,
};

/** The engine's name rule for every YAML store key (dfe-engine auth/store_names.py VALID_NAME). */
export const STORE_NAME_VALIDATOR = {
  regex: /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must start with a letter or number, contain only letters, numbers, dots, underscores and hyphens, and be at most 128 characters`,
};

/** The engine's organisation name rule (dfe-engine orgs/models.py ORG_NAME_PATTERN). */
export const ORG_NAME_VALIDATOR = {
  regex: /^[A-Za-z0-9][A-Za-z0-9._-]*$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must start with a letter or number and contain only letters, numbers, dots, underscores and hyphens`,
};

/** The engine's rule and hunt name rule (dfe-engine api/v1/rules.py and api/v1/hunts.py). */
export const RULE_HUNT_NAME_VALIDATOR = {
  regex: /^[a-zA-Z0-9_-]+$/,
  message: (fieldName: string = 'Name') =>
    `${fieldName} must contain only letters, numbers, underscores and hyphens`,
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
