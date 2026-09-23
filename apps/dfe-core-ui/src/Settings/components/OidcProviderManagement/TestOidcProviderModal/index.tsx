import { Modal } from '@/core/components/Modal';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IconTestPipe } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';
import { TestOidcProviderResponse } from './TestOidcProviderResponse';

export const TestOidcProviderModal = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            icon={<IconTestPipe />}
            onClick={() => setOpen(true)}
          >
            Test OIDC Provider
          </Button>
        </RbacProtected.Unrestricted>
      </RbacProtected>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button type="text" icon={<IconTestPipe />} disabled>
          Test OIDC Provider
        </Button>
      </RbacProtected.Restricted>
      <Modal
        title="Test OIDC Provider"
        open={open}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <TestOidcProviderResponse oidcProviderName={oidcProviderName} />
      </Modal>
    </>
  );
};
