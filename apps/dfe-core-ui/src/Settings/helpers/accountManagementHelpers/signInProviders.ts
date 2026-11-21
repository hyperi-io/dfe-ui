import type { TAccountsItemSummary } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';

export type TSignInAccount = Pick<
  TAccountsItemSummary,
  'external' | 'identities' | 'oidc_id' | 'oidc_type'
>;

export type TSignInProvider = { name: string; type: string };

/** The OIDC providers that reach an account, each once: the one owning it, then each linked sign-in's. */
export const signInProviders = (account: TSignInAccount): TSignInProvider[] => {
  const owner =
    account.external && account.oidc_id
      ? [{ name: account.oidc_id, type: account.oidc_type }]
      : [];
  const linked = (account.identities ?? []).map((identity) => ({
    name: identity.provider,
    type: identity.provider_type,
  }));
  return [...owner, ...linked].filter(
    (provider, index, all) =>
      all.findIndex(({ name }) => name === provider.name) === index,
  );
};
