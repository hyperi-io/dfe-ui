import {
  Modal as AntdModal,
  Button,
  type ModalProps as AntdModalProps,
} from 'antd';
import { useState } from 'react';

interface ModalProps extends AntdModalProps {
  onClose?: () => void;
}

export const Modal = ({
  open: openInitial,
  onClose,
  children,
  ...props
}: ModalProps) => {
  const [open, setOpen] = useState(openInitial);
  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <AntdModal
      open={open}
      onCancel={handleClose}
      footer={
        <Button key="close" onClick={handleClose}>
          Close
        </Button>
      }
      width={600}
      {...props}
    >
      <div className="flex items-center flex-col gap-y-2 mt-4">{children}</div>
    </AntdModal>
  );
};
