import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useFetchSecurityAccount } from '@/Settings/hooks/accounts/useFetchSecurityAccount';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { AccountDetailCard } from './AccountDetailCard';
import { ResetPasswordModal } from './ResetPasswordModal';

// The recovery account a gitops deployment seeds from its deploy repo; the name is fixed.
const BREAKGLASS_USERNAME = 'breakglass';

const RETIRED_REASON =
  'This account is retired and cannot sign in, so there is nothing to reset.';

export const SecurityAccountsDetails = () => {
  const { data: setupStatus, isLoading: isLoadingStatus } =
    useFetchSetupStatus();
  // The deployment may rename its admin, so the engine names it.
  const adminName = isLoadingStatus
    ? null
    : setupStatus?.admin_username || 'admin';

  const admin = useFetchSecurityAccount({ username: adminName });
  const breakGlass = useFetchSecurityAccount({
    username: BREAKGLASS_USERNAME,
  });

  const isLoading = isLoadingStatus || admin.isLoading || breakGlass.isLoading;
  const failure = admin.error ?? breakGlass.error;
  const adminRetired =
    !!admin.data && (!!setupStatus?.admin_retired || !admin.data.enabled);
  const noAccounts = !isLoading && !failure && !admin.data && !breakGlass.data;

  return (
    <div className="flex flex-col gap-4">
      {admin.data && (
        <AccountDetailCard
          account={admin.data}
          retired={adminRetired}
          action={
            <ResetPasswordModal
              username={admin.data.username}
              disabledReason={adminRetired ? RETIRED_REASON : undefined}
            />
          }
        />
      )}
      {breakGlass.data && (
        <AccountDetailCard
          account={breakGlass.data}
          action={<ResetPasswordModal username={breakGlass.data.username} />}
        />
      )}

      {failure && <ApiErrorNotification error={failure} />}

      {noAccounts && (
        <NotificationCard
          className="w-full"
          type="warning"
          icon={<IconInfoCircle />}
          title="This deployment has no admin or break-glass account"
          description="To get the admin back, set DFE_AUTH_LOCAL_ADMIN_PASSWORD for the engine and restart it. If the admin was retired, first remove admin_retired from governance/settings/auth.yaml in the deploy repo."
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
