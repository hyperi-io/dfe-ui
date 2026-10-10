type TScopes = string | readonly string[] | null | undefined;

const splitScopes = (value: string): string[] =>
  value.split(/\s+/).filter(Boolean);

/** Scopes as a list, from a provider's list or the setup status's string. */
export const toScopeList = (scopes: TScopes): string[] =>
  typeof scopes === 'string'
    ? splitScopes(scopes)
    : (scopes ?? []).flatMap(splitScopes);

/**
 * The scopes field a create or update sends. An empty list is omitted because
 * the engine refuses one, and a list equal to `current` is omitted so a save
 * never pins the provider type's default scopes.
 */
export const toScopesRequest = (
  scopes: TScopes,
  current?: TScopes,
): { scopes?: string[] } => {
  const list = toScopeList(scopes);
  const unchanged =
    current !== undefined && list.join(' ') === toScopeList(current).join(' ');
  return list.length > 0 && !unchanged ? { scopes: list } : {};
};
