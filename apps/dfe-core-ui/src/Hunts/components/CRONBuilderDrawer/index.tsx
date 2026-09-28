import { Drawer } from '@/core/components/Drawer';
import { Input, InputProps, TabsProps } from 'antd';
import { useState } from 'react';
import {
  CRONBuilderProvider,
  useCRONBuilderContext,
} from './CRONBuilder.context';
import { resetCronExpression } from './CRONBuilder.helpers';
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

export const CRONBuilderDrawerBase = ({
  onChange,
  ...props
}: CRONBuilderProps) => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { formValue, updateCronExpression } = useCRONBuilderContext();

  const openDrawer = () => {
    updateCronExpression({
      raw: formValue || resetCronExpression('minutes'),
    });
    setIsDrawerVisible(true);
  };

  const handleChange = (value: string) => {
    setIsDrawerVisible(false);
    onChange?.(value);
  };
  return (
    <>
      <Input
        {...props}
        onClick={openDrawer}
        readOnly
      />
      <Drawer
        title="CRON Schedule Builder"
        size={600}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        preventClickaway={{
          enabled: false,
        }}
      >
        <EditCRON {...props} onChange={handleChange} />
      </Drawer>
    </>
  );
};

export const CRONBuilderDrawer = ({ value, ...props }: CRONBuilderProps) => {
  return (
    <CRONBuilderProvider value={value?.toString()}>
      <CRONBuilderDrawerBase value={value} {...props} />
    </CRONBuilderProvider>
  );
};
