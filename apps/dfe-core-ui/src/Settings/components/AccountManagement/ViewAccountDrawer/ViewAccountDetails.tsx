import { EmptyDetail } from '@/core/components/EmptyDetail';
import { GenericErrorCard } from '@/core/components/GenericError';
import { Tooltip } from '@/core/components/Tooltip';
import {
  formatDateToString,
  formatDateXAgo,
} from '@/core/helpers/date.helpers';
import {
  isOrgAccount,
  ORG_ROLE_OPTIONS,
  orgRoleOf,
} from '@/core/helpers/orgRoles';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { cn } from '@/core/utils/style';
import { AccountOrg } from '@/Settings/components/AccountManagement/AccountOrg';
import { ProviderBadge } from '@/Settings/components/AccountManagement/ProviderBadge';
import { LinkedSignIns } from '@/Settings/components/AccountManagement/ViewAccountDrawer/LinkedSignIns';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { useFetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import type { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = ({ label = 'None' }: { label?: string }) => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">
    {label}
  </span>
);

/** The account's state in words, read the way the account table reads it. */
const accountStatus = (account: TAccountDetailResponse, retired: boolean) => {
  if (retired) return 'Retired';
  if (account.blocked) return 'Blocked';
  if (!account.enabled) return 'Inactive';
  if (account.org_enabled === false) return 'Organisation disabled';
  return 'Active';
};

export const ViewAccountDetails = ({ username }: { username: string }) => {
  const { data, isLoading, error } = useFetchAccountDetail({ username });
  const { data: yours } = useFetchYourOrganisation();
  // The engine names its own bootstrap admin, so a renamed one is still marked.
  const { data: setupStatus } = useFetchSetupStatus();

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading {username} details</p>
      </>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title={`Error fetching ${username} details`}
        description={error.message}
      />
    );
  }

  if (!data) {
    return (
      <EmptyDetail
        title="No account details found"
        description="Please try again later."
      />
    );
  }

  const retired =
    Boolean(setupStatus?.admin_retired) &&
    data.username === setupStatus?.admin_username;
  // Another organisation's account holds a role there, where yours holds groups.
  const orgAccount = isOrgAccount(data.org, yours?.name);
  const role = orgRoleOf(data.org, data.groups ?? []);
  // Held only through a sign-in, so DFE cannot remove it by membership.
  const linked = new Map(
    (data.linked_groups ?? []).map((group) => [group.name, group]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <h1 className="text-lg font-semibold break-all">
          {data.name?.trim() || data.username}
        </h1>
        <Tooltip destroyOnHidden title={formatDateToString(data.updated_at)}>
          <p className="flex shrink-0 items-center text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-full px-4 py-1">
            Updated {formatDateXAgo(data.updated_at)}
          </p>
        </Tooltip>
      </div>
      {/* Baselines line each label up with the first line of its value, tags included. */}
      <dl className="grid grid-cols-[160px_1fr] items-baseline gap-x-6 gap-y-3">
        <dt className={dataListTermStyle}>Username:</dt>
        <dd className="break-all">{data.username}</dd>
        <dt className={dataListTermStyle}>Email:</dt>
        <dd className="break-all">{data.email?.trim() || <EmptyData />}</dd>
        <dt className={dataListTermStyle}>Organisation:</dt>
        <dd>
          <AccountOrg
            admin={data.admin}
            displayName={data.org_display_name}
            groups={data.groups}
            org={data.org}
          />
        </dd>
        {orgAccount ? (
          <>
            <dt className={dataListTermStyle}>Role:</dt>
            <dd>
              {ORG_ROLE_OPTIONS.find(({ value }) => value === role)?.label}
            </dd>
          </>
        ) : (
          <>
            <dt className={dataListTermStyle}>Groups:</dt>
            <dd>
              {data.groups?.length > 0 ? (
                <ul className="flex flex-wrap items-center gap-2">
                  {data.groups.map((group) => {
                    const link = linked.get(group);
                    return (
                      <li
                        key={group}
                        className={cn(TAG_CLASS, 'whitespace-normal break-all')}
                      >
                        {link ? (
                          <Tooltip
                            destroyOnHidden
                            title={`Held through its ${link.provider} sign-in, so it follows what ${link.provider} asserts`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <ProviderBadge
                                size="small"
                                type={link.provider_type ?? ''}
                              />
                              {group}
                            </span>
                          </Tooltip>
                        ) : (
                          group
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyData />
              )}
            </dd>
          </>
        )}
        <dt className={dataListTermStyle}>Status:</dt>
        <dd>{accountStatus(data, retired)}</dd>
        <dt className={dataListTermStyle}>Last Sign-in:</dt>
        <dd>
          {data.last_login_at ? (
            <Tooltip
              destroyOnHidden
              title={formatDateToString(data.last_login_at)}
            >
              <span>{formatDateXAgo(data.last_login_at)}</span>
            </Tooltip>
          ) : (
            <EmptyData label="Never" />
          )}
        </dd>
        <dt className={dataListTermStyle}>Created At:</dt>
        <dd>{formatDateToString(data.created_at)}</dd>
        <dt className={dataListTermStyle}>Linked Sign-ins:</dt>
        <dd>
          {data.identities?.length ? (
            <LinkedSignIns
              identities={data.identities}
              username={data.username}
            />
          ) : (
            <EmptyData />
          )}
        </dd>
      </dl>
    </div>
  );
};
