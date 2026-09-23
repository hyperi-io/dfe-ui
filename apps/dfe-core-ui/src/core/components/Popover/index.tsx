import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';

export const Popover = (props: AntdPopoverProps) => {
  return <AntdPopover destroyOnHidden {...props} />;
};
