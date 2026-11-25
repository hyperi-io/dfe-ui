import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { ReauthPanel } from '@/core/components/ReauthPanel';
import { useRevokeApiKey } from '@/Settings/hooks/apiKeys/useRevokeApiKey';
import { IconInfoCircle, IconTrash } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useRef, useState } from 'react';

export const RevokeApiKeyModal = ({
  shortToken,
  name,
}: {
  shortToken: string;
  name: string;
}) => {
  const [open, setOpen] = useState(false);

  // Every revoke asks for the password again.
  const grant = useRef<string>(undefined);
  const {
    mutate: revokeApiKey,
    isPending,
    error,
    reset,
  } = useRevokeApiKey({
    reauth: () => grant.current,
    onSuccess: () => {
      grant.current = undefined;
      setOpen(false);
    },
  });

  const close = () => {
    reset();
    setOpen(false);
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
        title={`Revoke ${name}?`}
        destroyOnHidden
        open={open}
        onCancel={close}
        footer={null}
      >
        <ReauthPanel
          confirmLabel="Revoke API Key"
          danger
          error={error}
          isPending={isPending}
          kind="api_key"
          target={shortToken}
          onCancel={close}
          onGranted={(granted) => {
            grant.current = granted;
            revokeApiKey(shortToken);
          }}
        >
          <NotificationCard
            icon={<IconInfoCircle />}
            title="This action cannot be undone."
            type="warning"
          />
        </ReauthPanel>
      </Modal>
    </>
  );
};
