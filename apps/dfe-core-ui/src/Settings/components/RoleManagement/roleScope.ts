/** Held to one organisation by binding, not by its scoped flag: its writes rule the flag out. */
const ORG_ADMIN_ROLE = 'org_admin';

/** What an organisation-scoped role is, as its card and its details explain it. */
export const ORG_SCOPED_HELP =
  "Held to the organisations its holder belongs to, so it never reads another organisation's data.";

/** Whether *role* is held to its holder's organisations: scoped, or the org admin role the engine binds to one organisation. */
export const isOrgScoped = (role: { name: string; scoped: boolean }) =>
  role.scoped || role.name === ORG_ADMIN_ROLE;
