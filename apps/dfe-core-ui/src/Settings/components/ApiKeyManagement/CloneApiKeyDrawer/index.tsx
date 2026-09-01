import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { usePreventNavigate } from '@/core/hooks/usePreventNavigate';
import {
  CreateApiKeyForm,
  CreateApiKeyFormSchema,
} from '@/Settings/components/ApiKeyManagement/CreateApiKeyForm';
import { TApiKeyCreateResponse } from '@/Settings/hooks/apiKeys/useCreateApiKey/types';
import { IconCopy } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useCallback, useState } from 'react';

export const CloneApiKeyDrawer = ({
  initialValues,
}: {
  initialValues: CreateApiKeyFormSchema;
}) => {
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
          <Button
            type="default"
            aria-label="Clone API Key"
            icon={<IconCopy />}
            onClick={() => setOpen(true)}
            size="small"
            shape="circle"
          />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button
            type="default"
            aria-label="Clone API Key"
            icon={<IconCopy />}
            disabled
            size="small"
            shape="circle"
          />
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title={data ? 'API Key Generated' : 'Clone API Key'}
        open={open}
        onClose={handleClose}
        keyboard={!mustAcknowledgeCopy}
      >
        <CreateApiKeyForm
          initialValues={initialValues}
          onSuccess={handleSuccess}
          onAccept={handleAccept}
        />
      </Drawer>
    </>
  );
};
