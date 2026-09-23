import { FormNotification } from '@/core/components/FormNotification';
import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useRevokeApiKey } from '@/Settings/hooks/apiKeys/useRevokeApiKey';
import { IconInfoCircle, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const RevokeApiKeyModal = ({
  shortToken,
  name,
}: {
  shortToken: string;
  name: string;
}) => {
  const [open, setOpen] = useState(false);

  const {
    mutate: revokeApiKey,
    isPending,
    error,
  } = useRevokeApiKey({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handleRevokeApiKey = () => {
    revokeApiKey(shortToken);
  };
  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.api_key_delete}>
        <RbacProtected.Unrestricted>
          <Button
            type="default"
            size="small"
            shape="circle"
            aria-label="Revoke API Key"
            icon={<IconTrash />}
            onClick={() => setOpen(true)}
            danger
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="default"
            size="small"
            shape="circle"
            aria-label="Revoke API Key"
            icon={<IconTrash />}
            disabled
            danger
          />
        </RbacProtected.Restricted>
      </RbacProtected>

      <Modal
        classNames={{ body: 'flex flex-col gap-2' }}
        destroyOnHidden
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <p>
          Are you sure you want to revoke this API key:{' '}
          <span className="font-bold">{name}</span>?
        </p>
        <NotificationCard
          icon={<IconInfoCircle />}
          title="This action cannot be undone."
          type="warning"
        />

        {error && <FormNotification type="error" text={error.message} />}

        <Button
          type="primary"
          danger
          onClick={handleRevokeApiKey}
          loading={isPending}
        >
          Revoke API Key
        </Button>
      </Modal>
    </>
  );
};
