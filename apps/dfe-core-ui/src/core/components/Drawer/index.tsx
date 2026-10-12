import { IconX } from '@repo/dfe-icons';
import {
  Drawer as AntdDrawer,
  Button,
  type DrawerProps as AntdDrawerProps,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClickawayModal } from './ClickawayModal';

interface DrawerProps extends AntdDrawerProps {
  onClose?: () => void;
  title: React.ReactNode | string;
  preventClickaway?: {
    title?: string;
    message?: string;
    enabled?: boolean;
    // Close only from the warning's confirm action. The X, mask, and Escape
    // open the warning and do not close the drawer on their own.
    explicit?: boolean;
    confirmLabel?: string;
    cancelLabel?: string;
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

const isDrawerCloseControl = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('[data-drawer-close], .ant-drawer-close'));

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

    if (isMaskClick && confirmOpenRef.current && !preventClickaway.explicit) {
      closeDrawer();
      return;
    }

    confirmOpenRef.current = true;
    setIsConfirmOpen(true);
  };

  const handleClose: AntdDrawerProps['onClose'] = (event) => {
    const target = 'target' in event ? event.target : null;
    const fromCloseControl = isDrawerCloseControl(target);
    requestClose(event.type === 'click' && !fromCloseControl);
  };

  useEffect(() => {
    // Explicit close is only the warning's confirm action. A click on the
    // drawer, including the header close control, must not dismiss it.
    if (!isConfirmOpen || preventClickaway.explicit) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (
        isConfirmModal(event.target) ||
        isDrawerMask(event.target) ||
        isDrawerCloseControl(event.target)
      ) {
        return;
      }
      if (isDrawerPanel(event.target)) {
        closeConfirm();
      }
    };

    // The click that opens the warning is still bubbling. Attaching on the
    // next turn keeps that click from dismissing the warning immediately.
    const timeoutId = window.setTimeout(() => {
      document.addEventListener('click', onDocumentClick);
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('click', onDocumentClick);
    };
  }, [isConfirmOpen, preventClickaway.explicit]);

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
        extra={
          <Button
            shape="circle"
            aria-label="Close"
            data-drawer-close
            icon={<IconX />}
            onClick={(event) => {
              event.stopPropagation();
              if (preventClickaway.enabled && preventClickaway.explicit) {
                requestClose(false);
                return;
              }
              closeDrawer();
            }}
          />
        }
        footer={null}
      >
        {children}
        {isConfirmOpen &&
          createPortal(
            <ClickawayModal
              onOk={closeDrawer}
              onCancel={closeConfirm}
              title={preventClickaway.title}
              message={preventClickaway.message}
              confirmLabel={preventClickaway.confirmLabel}
              cancelLabel={preventClickaway.cancelLabel}
            />,
            document.body,
          )}
      </AntdDrawer>
    </>
  );
};
