import { cn } from '@/core/utils/style';
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
  className,
  ...props
}: ModalProps) => {
  const [open, setOpen] = useState(openInitial);

  const handleClose: AntdModalProps['onCancel'] = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
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
      <div className={cn('flex items-center flex-col gap-y-2 mt-4', className)}>
        {children}
      </div>
    </AntdModal>
  );
};
