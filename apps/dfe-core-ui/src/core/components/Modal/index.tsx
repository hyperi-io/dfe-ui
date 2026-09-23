import { cn } from '@/core/utils/style';
import {
  Modal as AntdModal,
  Button,
  type ModalProps as AntdModalProps,
} from 'antd';

interface ModalProps extends AntdModalProps {
  onClose?: () => void;
}

export const Modal = ({
  open,
  onClose,
  onCancel,
  children,
  className,
  ...props
}: ModalProps) => {
  const handleClose: AntdModalProps['onCancel'] = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    onCancel?.(event);
    onClose?.();
  };

  return (
    <AntdModal
      footer={
        <Button
          key="close"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCancel?.(event as never);
            onClose?.();
          }}
        >
          Close
        </Button>
      }
      width={600}
      {...props}
      open={open}
      onCancel={handleClose}
    >
      <div className={cn('flex flex-start flex-col gap-y-2 mt-4', className)}>
        {children}
      </div>
    </AntdModal>
  );
};
