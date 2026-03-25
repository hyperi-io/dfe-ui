import { IconX } from '@repo/dfe-icons';
import {
  Drawer as AntdDrawer,
  Button,
  type DrawerProps as AntdDrawerProps,
} from 'antd';

interface DrawerProps extends AntdDrawerProps {
  onClose?: () => void;
  title: string;
}

export const Drawer = ({ children, onClose, title, ...props }: DrawerProps) => {
  return (
    <AntdDrawer
      title={title}
      closeIcon={null}
      extra={
        <Button shape="circle" icon={<IconX />} onClick={() => onClose?.()} />
      }
      footer={null}
      placement="right"
      size="40%"
      destroyOnHidden
      {...props}
    >
      {children}
    </AntdDrawer>
  );
};
