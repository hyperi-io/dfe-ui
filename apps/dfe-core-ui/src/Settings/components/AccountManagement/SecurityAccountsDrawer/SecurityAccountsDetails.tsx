import { useFetchAccountDetail } from '@/Settings/hooks/accounts/useFetchAccountDetail';
import { Spin } from 'antd';
import { AccountDetailCard } from './AccountDetailCard';
import { ResetPasswordModal } from './ResetPasswordModal';
import { RotatePasswordModal } from './RotatePasswordModal';

export const SecurityAccountsDetails = () => {
  const { data: adminAccount, isLoading: isLoadingAdminAccount } =
    useFetchAccountDetail({
      username: 'admin',
    });

  const { data: breakGlassAccount, isLoading: isLoadingBreakGlassAccount } =
    useFetchAccountDetail({
      username: 'breakglass',
    });

  const isLoading = isLoadingAdminAccount || isLoadingBreakGlassAccount;

  return (
    <div className="flex flex-col gap-4">
      {adminAccount && (
        <AccountDetailCard
          account={adminAccount}
          action={<ResetPasswordModal username={adminAccount.username} />}
        />
      )}
      {breakGlassAccount && (
        <AccountDetailCard
          account={breakGlassAccount}
          action={<RotatePasswordModal username={breakGlassAccount.username} />}
        />
      )}

      {isLoading && (
        <span className="flex items-center gap-2 w-full justify-center mt-4">
          <Spin /> <span className="sr-only">Loading security accounts...</span>
        </span>
      )}
    </div>
  );
};
