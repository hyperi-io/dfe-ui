import { ReauthPanel } from '@/core/components/ReauthPanel';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';

/** Says what deleting an organisation takes with it, then takes the password that confirms it. */
export const DeleteOrganisationForm = ({
  org_name,
  onConfirm,
  error,
  isPending,
  onCancel,
}: {
  org_name: string;
  onConfirm: (grant: string) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel: () => void;
}) => {
  const {
    data: { total_size: accountCount },
  } = useFetchInfiniteFilteredAccounts({ org: org_name, page_size: 1 });
  const accounts =
    accountCount === undefined
      ? 'Its accounts'
      : `Its ${accountCount} ${accountCount === 1 ? 'account' : 'accounts'}`;

  return (
    <ReauthPanel
      confirmLabel="Delete"
      danger
      error={error}
      isPending={isPending}
      kind="org"
      target={org_name}
      onCancel={onCancel}
      onGranted={onConfirm}
    >
      <p>
        {`${accounts}, API keys and sign-in providers are deleted with it. This cannot be undone.`}
      </p>
    </ReauthPanel>
  );
};
