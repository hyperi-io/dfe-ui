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

/** The engine's env var name rule (dfe-engine auth/oidc/credential_env.py). */
export const ENV_VAR_NAME_VALIDATOR = {
  regex: /^[A-Za-z_][A-Za-z0-9_]*$/,
  message:
    'Enter an environment variable name such as OKTA_CLIENT_SECRET, not the value itself',
};
