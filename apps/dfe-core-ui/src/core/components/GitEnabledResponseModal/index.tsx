import { CopyCodeBlock } from '@/core/components/CopyCodeBlock';
import { Modal } from '@/core/components/Modal';
import { TCurrentUserResetPasswordResponse } from '@/core/hooks/useCurrentUserResetPassword/types';
import { useState } from 'react';

export const GitEnabledResponseModal = ({
  data,

  onCancel,
}: {
  data?: TCurrentUserResetPasswordResponse;
  onCancel?: () => void;
}) => {
  const [open, setOpen] = useState(true);

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  const isGitEnabled = data?.git?.enabled;
  const isAlreadyGitCommitted = !data?.git?.committed;

  if (!isGitEnabled || isAlreadyGitCommitted) {
    return null;
  }

  return (
    <Modal
      title="Git is enabled for this account"
      open={open}
      onCancel={handleCancel}
      footer={null}
    >
      <div>
        <p>
          Changes have not been committed yet. Please perform the following
          action to commit the changes:
        </p>
        <CopyCodeBlock code={data?.git.pending?.command ?? ''} />

        {data?.git.pending?.pr_url && data?.git.pending?.branch && (
          <dl className="grid grid-cols-2 gap-2">
            {data?.git.pending?.pr_url && (
              <>
                <dt>PR URL</dt>
                <dd>{data?.git.pending?.pr_url ?? ''}</dd>
              </>
            )}
            {data?.git.pending?.branch && (
              <>
                <dt>PR Branch</dt>
                <dd>{data?.git.pending?.branch ?? ''}</dd>
              </>
            )}
          </dl>
        )}
      </div>
    </Modal>
  );
};
