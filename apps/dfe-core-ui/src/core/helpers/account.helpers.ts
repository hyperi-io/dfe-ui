type TAccountIdentity = {
  username: string;
  name?: string | null;
  email?: string | null;
};

/** OIDC usernames are opaque IdP subjects, so the username is the last resort. */
export const getAccountDisplayName = ({
  name,
  email,
  username,
}: TAccountIdentity): string => name?.trim() || email?.trim() || username;
