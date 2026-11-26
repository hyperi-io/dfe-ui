/** The role an org account holds inside its organisation, through one of the two groups each organisation carries. */
export type TOrgRole = 'viewer' | 'admin';

export const ORG_ROLE_OPTIONS: { label: string; value: TOrgRole }[] = [
  { label: 'Viewer', value: 'viewer' },
  { label: 'Admin', value: 'admin' },
];

/** The group that gives *role* in *org*. */
export const orgRoleGroup = (org: string, role: TOrgRole) =>
  `${org}-${role === 'admin' ? 'admins' : 'viewers'}`;

/** Both of *org*'s role groups. */
export const orgRoleGroups = (org: string) => [
  orgRoleGroup(org, 'admin'),
  orgRoleGroup(org, 'viewer'),
];

/** Whether an account bound to *org* is an org account: bound to an organisation other than yours. */
export const isOrgAccount = (
  org: string | null | undefined,
  yourOrg: string | null | undefined,
) => Boolean(org) && org !== yourOrg;

/** The role an account of *org* holding *groups* has, viewer unless it holds the admin group. */
export const orgRoleOf = (org: string, groups: readonly string[]): TOrgRole =>
  groups.includes(orgRoleGroup(org, 'admin')) ? 'admin' : 'viewer';

/** The org whose admin or viewer group *group* is, else null: the engine scopes each to `org:<org>`. */
export const orgOfRoleGroup = (group: {
  name: string;
  scope: string;
}): string | null => {
  if (!group.scope.startsWith('org:')) return null;
  const org = group.scope.slice('org:'.length);
  return orgRoleGroups(org).includes(group.name) ? org : null;
};
