import { Drawer } from '@/core/components/Drawer';
import { Input, InputProps, TabsProps } from 'antd';
import { useState } from 'react';
import {
  CRONBuilderProvider,
  useCRONBuilderContext,
} from './CRONBuilder.context';
import { EditCRON } from './EditCRON';

export interface CRONBuilderProps extends Omit<
  InputProps,
  'classNames' | 'onChange'
> {
  classNames?: {
    tabs?: TabsProps['classNames'];
    root: string;
  };
  onChange?: (value: string) => void;
}

export const CRONBuilderBase = ({ onChange, ...props }: CRONBuilderProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { cronExpression } = useCRONBuilderContext();

  const handleChange = (value: string) => {
    setIsDrawerVisible(false);
    onChange?.(value);
  };
  return (
    <>
      <Input
        onClick={() => {
          setIsDrawerVisible(true);
        }}
        readOnly
        value={cronExpression}
        {...props}
      />
      <Drawer
        title="CRON Schedule Builder"
        size="30%"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <EditCRON {...props} onChange={handleChange} />
      </Drawer>
    </>
  );
};

export const CRONBuilder = ({ value, ...props }: CRONBuilderProps) => {
  return (
    <CRONBuilderProvider value={value?.toString()}>
      <CRONBuilderBase value={value} {...props} />
    </CRONBuilderProvider>
  );
};
