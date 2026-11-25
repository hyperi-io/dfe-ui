import { NotificationCard } from '@/core/components/NotificationCard';
import { ReauthPanel } from '@/core/components/ReauthPanel';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import { Spin } from 'antd';

/** Confirms deleting an OIDC provider with the password, in one panel. */
export const DeleteOidcProviderForm = ({
  oidcProviderName,
  onConfirm,
  error,
  isPending,
  onCancel,
}: {
  oidcProviderName: string;
  onConfirm: (grant: string) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel: () => void;
}) => {
  const {
    data: { total_size: accountsCount = 0 },
    isLoading: isLoadingAccounts,
  } = useFetchInfiniteFilteredAccounts({
    oidc_id: oidcProviderName,
    blocked: false,
  });

  return (
    <ReauthPanel
      confirmLabel="Delete"
      danger
      error={error}
      isPending={isPending || isLoadingAccounts}
      kind="provider"
      target={oidcProviderName}
      onCancel={onCancel}
      onGranted={onConfirm}
    >
      {isLoadingAccounts && (
        <>
          <Spin />{' '}
          <span className="sr-only">Loading associated accounts...</span>
        </>
      )}

      {(accountsCount ?? 0) > 0 && (
        <NotificationCard
          type="error"
          title="This action cannot be undone."
          // The count includes accounts that only link a sign-in through the provider, which the delete unlinks rather than deletes.
          description={`${accountsCount} ${accountsCount === 1 ? 'account signs' : 'accounts sign'} in through this OIDC provider. Accounts it owns will be deleted and their access revoked. Accounts only linked to it keep their other sign-ins.`}
        />
      )}
    </ReauthPanel>
  );
};
