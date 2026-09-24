import { SectionCard } from '@/core/components/SectionCard';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { IconShield, IconShieldOff } from '@repo/dfe-icons';

export const AccountDetailCard = ({
  account,
  action,
}: {
  account: TAccountDetailResponse;
  action: React.ReactNode;
}) => {
  const { name, username, email, phone, enabled } = account;
  return (
    <SectionCard
      icon={enabled ? <IconShield /> : <IconShieldOff />}
      title={name || username}
      description={
        <dl className="grid grid-cols-2 gap-2">
          {username && (
            <>
              <dt>Username:</dt>
              <dd>{username}</dd>
            </>
          )}
          {email && (
            <>
              <dt>Email:</dt>
              <dd>{email}</dd>
            </>
          )}
          {phone && (
            <>
              <dt>Phone:</dt>
              <dd>{phone}</dd>
            </>
          )}
        </dl>
      }
      rightTitleSlot={action}
    />
  );
};
