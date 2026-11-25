import { ReauthPanel } from '@/core/components/ReauthPanel';

/** Confirms deleting a role with the password, in one panel. */
export const DeleteRoleForm = ({
  role_name,
  onConfirm,
  error,
  isPending,
  onCancel,
}: {
  role_name: string;
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
    kind="role"
    target={role_name}
    onCancel={onCancel}
    onGranted={onConfirm}
  >
    <p>This cannot be undone.</p>
  </ReauthPanel>
);
