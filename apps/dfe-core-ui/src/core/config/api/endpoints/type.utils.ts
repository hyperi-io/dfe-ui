/**
 * Extracts keys from T whose names include a given Substring.
 * T should be an object type — the filter runs over `keyof T`.
 */
export type KeysWithSubstring<T, Substring extends string> = {
  [K in keyof T]: K extends `${string}${Substring}${string}` ? K : never;
}[keyof T];

/**
 * Converts OpenAPI `{param}` placeholders to `${string}` template literals,
 * so `/api/v1/sources/{name}` becomes `` `/api/v1/sources/${string}` ``.
 * Applies recursively for paths with multiple params.
 */
export type ReplaceParams<S extends string> =
  S extends `${infer Prefix}{${string}}${infer Suffix}`
    ? `${Prefix}${string}${ReplaceParams<Suffix>}`
    : S;
