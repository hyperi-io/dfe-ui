import { Tooltip as AntdTooltip, TooltipProps as AntdTooltipProps } from 'antd';

export type TooltipProps = AntdTooltipProps;

export const Tooltip = (props: TooltipProps) => {
  return <AntdTooltip destroyOnHidden {...props} />;
};
