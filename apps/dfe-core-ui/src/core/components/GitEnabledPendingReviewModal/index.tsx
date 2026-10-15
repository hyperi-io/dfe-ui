import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { TAccountResetPasswordResponse } from '@/core/hooks/useAccountResetPassword/types';
import { IconAlertCircle } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const GitEnabledPendingReviewModal = ({
  pending,
  onCancel,
}: {
  pending: TAccountResetPasswordResponse['git']['pending'];
  onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(true);

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  const isPending = pending?.command || pending?.pr_url || pending?.branch;

  if (!isPending) {
    return null;
  }

  return (
    <Modal
      title="Git is enabled for this account"
      open={open}
      onCancel={handleCancel}
      footer={
        <div className="flex gap-2">
          <Button type="default" onClick={handleCancel}>
            Cancel
          </Button>

          {pending?.pr_url && (
            <Button
              type="primary"
              href={pending?.pr_url}
              target="_blank"
              rel="noreferrer"
            >
              Open the review
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <NotificationCard
          type="warning"
          icon={<IconAlertCircle />}
          title="Merge the review to keep this password"
          description="The new password works now. This deployment reviews account changes, so a restart before the review merges brings back the old one."
        />
        {pending?.command && (
          <>
            <p>Run the following command to commit the changes:</p>
            <CopyCodeBlock code={pending?.command ?? ''} />
          </>
        )}

        {pending?.branch && (
          <dl className="flex flex-col gap-2">
            <dt className="font-medium">PR Branch:</dt>
            <dd>
              <CopyCodeBlock code={pending?.branch ?? ''} />
            </dd>
          </dl>
        )}
      </div>
    </Modal>
  );
};
