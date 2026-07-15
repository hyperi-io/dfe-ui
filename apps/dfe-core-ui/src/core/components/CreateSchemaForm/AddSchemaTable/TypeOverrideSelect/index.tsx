import { IconDots } from '@repo/dfe-icons';
import { Button, FormInstance, Popover, SelectProps } from 'antd';
import { useState } from 'react';
import { LazyMountedSelect } from './LazyMountedSelect';

interface TypeOverrideSelectProps extends SelectProps {
  typeDetails: {
    name: string | (string | number)[];
  };
  form: FormInstance;
}
export const TypeOverrideSelect = ({
  typeDetails,
  value,
  form,
  ...props
}: TypeOverrideSelectProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-1 w-full">
      {value && (
        <span className="text-xs bg-foreground/10 px-1 py-0.5 rounded-md dark:bg-dark-foreground/10">
          Override: {value}
        </span>
      )}
      <Popover
        destroyOnHidden
        content={
          <LazyMountedSelect
            className="min-w-48"
            value={value}
            typeDetails={typeDetails}
            form={form}
            {...props}
          />
        }
        trigger="click"
      >
        <Button
          icon={<IconDots />}
          className="ml-auto"
          size="small"
          type="default"
          shape="circle"
          onClick={() => setOpen(!open)}
        />
      </Popover>
    </div>
  );
};
