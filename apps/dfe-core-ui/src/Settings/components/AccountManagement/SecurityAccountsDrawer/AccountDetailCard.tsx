import { SectionCard } from '@/core/components/SectionCard';
import { TAccountDetailResponse } from '@/Settings/hooks/accounts/useFetchAccountDetail/types';
import { IconShield, IconShieldOff } from '@repo/dfe-icons';
import { Tag } from 'antd';

export const AccountDetailCard = ({
  account,
  action,
  retired = false,
}: {
  account: TAccountDetailResponse;
  action: React.ReactNode;
  retired?: boolean;
}) => {
  const { name, username, email, phone, enabled } = account;
  return (
    <SectionCard
      icon={enabled ? <IconShield /> : <IconShieldOff />}
      title={
        <>
          {name || username}
          {retired && <Tag color="default">Retired</Tag>}
        </>
      }
      description={
        <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
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
