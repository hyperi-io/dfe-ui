import { Tooltip } from '@/core/components/Tooltip';
import { orgRoleOf } from '@/core/helpers/orgRoles';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { IconCrown } from '@repo/dfe-icons';
import { Tag } from 'antd';

/** The display name of the org an account is bound to, in blue when it is your org (a root account's always is). An admin carries a crown inside the tag of the org it administers: your organisation's admins administer every org. */
export const AccountOrg = ({
  admin = false,
  displayName,
  groups = [],
  org,
}: {
  /** An admin of every organisation, crowned inside your organisation's tag. */
  admin?: boolean;
  displayName: string;
  groups?: readonly string[];
  org: string;
}) => {
  const { data: yourOrg, isLoading } = useFetchYourOrganisation();
  if (!displayName) {
    return (
      <span className="inline-flex items-center gap-1 text-foreground/50 dark:text-dark-foreground/50">
        None
        {admin && (
          <Tooltip destroyOnHidden title="Admin">
            <span className="flex">
              <IconCrown aria-label="Admin of every organisation" />
            </span>
          </Tooltip>
        )}
      </span>
    );
  }
  // Until your org's name arrives yours cannot be told from a customer's, so the tag waits plain.
  if (isLoading) {
    return <Tag className="m-0">{displayName}</Tag>;
  }
  const isYours = !org || org === yourOrg?.name;
  if (!isYours) {
    const crown = admin
      ? 'Admin of every organisation'
      : orgRoleOf(org, groups) === 'admin'
        ? `Admin of ${displayName}`
        : undefined;
    return (
      <Tag className="m-0">
        <span className="inline-flex items-center gap-1">
          {displayName}
          {crown && (
            <Tooltip destroyOnHidden title="Admin">
              <span className="flex">
                <IconCrown aria-label={crown} />
              </span>
            </Tooltip>
          )}
        </span>
      </Tag>
    );
  }
  return (
    <Tag color="blue" className="m-0">
      <span className="inline-flex items-center gap-1">
        {displayName}
        {admin && (
          <Tooltip destroyOnHidden title="Admin">
            <span className="flex">
              <IconCrown aria-label="Admin of every organisation" />
            </span>
          </Tooltip>
        )}
      </span>
      <span className="sr-only"> (your organisation)</span>
    </Tag>
  );
};
