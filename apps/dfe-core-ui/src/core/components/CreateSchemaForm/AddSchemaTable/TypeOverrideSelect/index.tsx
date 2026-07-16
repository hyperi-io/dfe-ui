import { IconDots, IconX } from '@repo/dfe-icons';
import { Button, FormInstance, Popover, SelectProps } from 'antd';
import { useState } from 'react';
import { LazyMountedSelect } from './LazyMountedSelect';

interface TypeOverrideSelectProps extends SelectProps {
  typeDetails: {
    type_form_name: string | (string | number)[];
    ch_override_form_name: string | (string | number)[];
  };
  form: FormInstance;
}
export const TypeOverrideSelect = ({
  typeDetails,
  value,
  form,
  onChange,
  ...props
}: TypeOverrideSelectProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-1 w-full">
      {value && (
        <span className="flex items-center gap-1 text-xs bg-foreground/10 px-2 pr-0 py-0.5 rounded-md dark:bg-dark-foreground/10">
          {value.startsWith('Enum16') ? value.split('(')[0] : value}
          <Button
            size="small"
            type="text"
            shape="circle"
            icon={<IconX />}
            onClick={() => {
              form.setFieldValue(typeDetails.ch_override_form_name, undefined);
            }}
          />
        </span>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        classNames={{
          content: 'min-w-72',
        }}
        destroyOnHidden
        title="ClickHouse Override Type"
        content={
          <LazyMountedSelect
            classNames={{
              root: 'w-full',
            }}
            value={value}
            typeDetails={typeDetails}
            form={form}
            onChange={(next) => {
              onChange?.(next);
              setOpen(false);
            }}
            // Keep the dropdown inside the popover so option clicks are not
            // treated as outside-clicks that destroy the select before onChange.
            getPopupContainer={(trigger) =>
              trigger.parentElement ?? document.body
            }
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
        />
      </Popover>
    </div>
  );
};
