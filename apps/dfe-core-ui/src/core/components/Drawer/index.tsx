import { IconX } from '@repo/dfe-icons';
import {
  Drawer as AntdDrawer,
  Button,
  type DrawerProps as AntdDrawerProps,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ClickawayModal } from './ClickawayModal';

interface DrawerProps extends AntdDrawerProps {
  onClose?: () => void;
  title: React.ReactNode | string;
  preventClickaway?: {
    title?: string;
    message?: string;
    enabled?: boolean;
  };
  onOk?: () => void;
}

const isDrawerMask = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('.ant-drawer-mask'));

const isDrawerPanel = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('.ant-drawer-content-wrapper'));

const isConfirmModal = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('[data-clickaway-card]'));

export const Drawer = ({
  children,
  preventClickaway = {
    enabled: true,
    message: 'Closing now may discard unsaved data.',
    title: 'Potential data loss warning',
  },
  onClose,
  title,
  ...props
}: DrawerProps) => {
  const confirmOpenRef = useRef(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const closeConfirm = () => {
    confirmOpenRef.current = false;
    setIsConfirmOpen(false);
  };

  const closeDrawer = () => {
    closeConfirm();
    onClose?.();
  };

  const requestClose = (isMaskClick: boolean) => {
    if (!preventClickaway.enabled) {
      closeDrawer();
      return;
    }

    if (isMaskClick && confirmOpenRef.current) {
      closeDrawer();
      return;
    }

    confirmOpenRef.current = true;
    setIsConfirmOpen(true);
  };

  const handleClose: AntdDrawerProps['onClose'] = (event) => {
    requestClose(event.type === 'click');
  };

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (isConfirmModal(event.target) || isDrawerMask(event.target)) {
        return;
      }
      if (isDrawerPanel(event.target)) {
        closeConfirm();
      }
    };

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [isConfirmOpen]);

  return (
    <>
      <AntdDrawer
        placement="right"
        destroyOnHidden
        size="40%"
        {...props}
        title={title}
        closeIcon={null}
        onClose={handleClose}
        extra={<Button shape="circle" icon={<IconX />} onClick={closeDrawer} />}
        footer={null}
      >
        {children}
        {isConfirmOpen && (
          <ClickawayModal
            onOk={closeDrawer}
            onCancel={closeConfirm}
            title={preventClickaway.title}
            message={preventClickaway.message}
          />
        )}
      </AntdDrawer>
    </>
  );
};
