import { cn } from '@/core/utils/style';
import { Splitter as AntdSplitter, type SplitterProps } from 'antd';
import { FC } from 'react';

interface CustomSplitterProps extends SplitterProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
}

const SplitterWrapper: FC<CustomSplitterProps> = ({
  className,
  leftPanelContent,
  rightPanelContent,
  ...props
}) => {
  return (
    <AntdSplitter
      className={cn('[&_.ant-splitter-bar]:px-4', className)}
      {...props}
    >
      <AntdSplitter.Panel min="12%" max="30%" defaultSize="20%">
        {leftPanelContent}
      </AntdSplitter.Panel>
      <AntdSplitter.Panel>{rightPanelContent}</AntdSplitter.Panel>
    </AntdSplitter>
  );
};

export const Splitter = Object.assign(SplitterWrapper, {
  Panel: AntdSplitter.Panel,
});
