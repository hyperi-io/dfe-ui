import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';

export const Popover = ({
  destroyOnHidden = false,
  ...props
}: AntdPopoverProps) => {
  return <AntdPopover destroyOnHidden={destroyOnHidden} {...props} />;
};
