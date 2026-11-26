import { ReauthPanel } from '@/core/components/ReauthPanel';

/** Confirms deleting an account with the password, in one panel. */
export const DeleteAccountForm = ({
  username,
  onConfirm,
  error,
  isPending,
  onCancel,
}: {
  username: string;
  onConfirm: (grant: string) => void;
  error?: Error | null;
  isPending?: boolean;
  onCancel: () => void;
}) => (
  <ReauthPanel
    confirmLabel="Delete"
    danger
    error={error}
    isPending={isPending}
    kind="account"
    target={username}
    onCancel={onCancel}
    onGranted={onConfirm}
  >
    <p>This cannot be undone.</p>
  </ReauthPanel>
);
