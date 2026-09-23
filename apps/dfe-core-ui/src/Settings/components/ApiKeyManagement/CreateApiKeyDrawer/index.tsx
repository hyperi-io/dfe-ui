import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { usePreventNavigate } from '@/core/hooks/usePreventNavigate';
import { CreateApiKeyForm } from '@/Settings/components/ApiKeyManagement/CreateApiKeyForm';
import { TApiKeyCreateResponse } from '@/Settings/hooks/apiKeys/useCreateApiKey/types';
import { Button } from 'antd';
import { useCallback, useState } from 'react';

export const CreateApiKeyDrawer = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<TApiKeyCreateResponse | null>(null);

  const mustAcknowledgeCopy = open && data != null;

  const handleAccept = useCallback(() => {
    setOpen(false);
    setData(null);
  }, []);

  const { confirmLeave } = usePreventNavigate({
    enabled: mustAcknowledgeCopy,
    blockBrowserBack: true,
    modal: {
      title: 'Have you copied the API key?',
      message: 'You will not be able to retrieve it later.',
      okText: 'I have copied the API key',
      cancelText: 'Cancel',
      okButtonProps: { danger: false },
    },
  });

  const handleSuccess = useCallback((data: TApiKeyCreateResponse) => {
    setData(data);
  }, []);

  const handleClose = useCallback(() => {
    confirmLeave(handleAccept);
  }, [confirmLeave, handleAccept]);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.api_key_write}>
        <RbacProtected.Unrestricted>
          <Button type="primary" onClick={() => setOpen(true)}>
            Generate API Key
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="primary" disabled>
            Generate API Key
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={data ? 'API Key Generated' : 'Generate API Key'}
        open={open}
        onClose={handleClose}
        keyboard={!mustAcknowledgeCopy}
        preventClickaway={{
          enabled: false,
        }}
      >
        <CreateApiKeyForm onSuccess={handleSuccess} onAccept={handleAccept} />
      </Drawer>
    </>
  );
};
