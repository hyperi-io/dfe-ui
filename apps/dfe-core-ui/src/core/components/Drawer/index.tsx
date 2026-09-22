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
  preventClickaway?: boolean;
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
  preventClickaway = false,
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

  const handleClose: AntdDrawerProps['onClose'] = (event) => {
    if (!preventClickaway) {
      closeDrawer();
      return;
    }

    if (event.type !== 'click') {
      closeDrawer();
      return;
    }

    if (confirmOpenRef.current) {
      closeDrawer();
      return;
    }

    confirmOpenRef.current = true;
    setIsConfirmOpen(true);
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
        title={title}
        closeIcon={null}
        // antd routes Escape through onClose, so without this only the X closes.
        onClose={handleClose}
        extra={<Button shape="circle" icon={<IconX />} onClick={closeDrawer} />}
        footer={null}
        placement="right"
        size="40%"
        destroyOnHidden
        {...props}
      >
        {children}
      </AntdDrawer>
      {isConfirmOpen && (
        <ClickawayModal onOk={closeDrawer} onCancel={closeConfirm} />
      )}
    </>
  );
};
