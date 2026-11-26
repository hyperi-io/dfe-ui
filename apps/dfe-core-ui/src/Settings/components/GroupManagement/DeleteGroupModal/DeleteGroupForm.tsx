import { ReauthPanel } from '@/core/components/ReauthPanel';

/** Confirms deleting a group with the password, in one panel. */
export const DeleteGroupForm = ({
  group_name,
  onConfirm,
  error,
  isPending,
  onCancel,
}: {
  group_name: string;
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
    kind="group"
    target={group_name}
    onCancel={onCancel}
    onGranted={onConfirm}
  >
    <p>Its members lose the roles it gives them. This cannot be undone.</p>
  </ReauthPanel>
);
