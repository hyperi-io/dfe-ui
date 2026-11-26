import { useReauthGrant } from '@/core/hooks/useReauthGrant';
import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { ProviderBadge } from '@/Settings/components/AccountManagement/ProviderBadge';
import { RbacProtected } from '@/core/components/RbacProtected';
import { formatDateXAgo } from '@/core/helpers/date.helpers';
import { cn } from '@/core/utils/style';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import type { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { useUnlinkIdentity } from '@/Settings/hooks/accounts/useUnlinkIdentity';
import { Button, Popconfirm } from 'antd';

type TLinkedIdentity = NonNullable<
  TAccountDetailResponse['identities']
>[number];

/** The IdP sign-ins linked to an account, each reaching it without a password, with an unlink action. */
export const LinkedSignIns = ({
  identities,
  username,
}: {
  identities: TLinkedIdentity[];
  username: string;
}) => {
  const { mutate: unlink, isPending, error } = useUnlinkIdentity({ username });
  // Asked for afresh on every unlink.
  const reauth = useReauthGrant(username);

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {identities.map((identity) => (
          <li
            key={identity.key}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex flex-col">
              <span>
                <span
                  className={cn(
                    TAG_CLASS,
                    'mr-2 inline-flex items-center gap-1',
                  )}
                >
                  <ProviderBadge size="small" type={identity.provider_type} />
                  {identity.provider}
                </span>
                {identity.email || identity.subject}
              </span>
              {identity.last_login_at && (
                <span className="text-xs text-foreground/40 dark:text-dark-foreground/40">
                  Last sign-in {formatDateXAgo(identity.last_login_at)}
                </span>
              )}
            </span>
            <RbacProtected action={RbacProtected.rbacActions.account_write}>
              <RbacProtected.Unrestricted>
                <Popconfirm
                  title="Unlink this sign-in?"
                  description={`It becomes an account of its own, and every session of ${username} ends.`}
                  okText="Unlink"
                  onConfirm={() =>
                    reauth.ask((grant) =>
                      unlink({ key: identity.key, reauth: grant }),
                    )
                  }
                >
                  <Button
                    danger
                    size="small"
                    loading={isPending}
                    aria-label={`Unlink ${identity.provider} sign-in`}
                  >
                    Unlink
                  </Button>
                </Popconfirm>
              </RbacProtected.Unrestricted>
              <RbacProtected.Restricted tooltip={{ show: true }}>
                <Button danger size="small" disabled>
                  Unlink
                </Button>
              </RbacProtected.Restricted>
            </RbacProtected>
          </li>
        ))}
      </ul>
      {error && <ApiErrorNotification error={error} />}
      {reauth.modal}
    </div>
  );
};
