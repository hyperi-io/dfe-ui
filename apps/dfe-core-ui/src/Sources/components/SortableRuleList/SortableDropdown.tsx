'use client';

import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, Dropdown, Select } from 'antd';
import { useState } from 'react';

export const SortableDropdown = ({
  onChange,
  onOpenChange,
  options,
  buttonRef,
  open: openProp,
  ruleName,
}: {
  onChange: (to: number) => void;
  onOpenChange: (open: boolean) => void;
  options: { value: number; label: string; disabled: boolean }[];
  buttonRef: React.Ref<HTMLButtonElement>;
  open: boolean;
  ruleName: string;
}) => {
  const [open, setOpen] = useState(openProp);
  return (
    <Dropdown
      trigger={['click']}
      destroyOnHidden
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        setOpen(next);
      }}
      popupRender={() => (
        <div
          className="rounded-md border border-foreground/15 bg-background p-2 shadow-md dark:border-dark-foreground/15 dark:bg-dark-background"
          onMouseDown={(event) => event.preventDefault()}
        >
          <Select
            autoFocus
            open
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.trim().toLowerCase()),
            }}
            virtual={false}
            className="w-44"
            placeholder="Search position"
            aria-label={`Search positions for ${ruleName}`}
            options={options}
            onChange={(to) => {
              onChange(to);
            }}
            getPopupContainer={(trigger) =>
              trigger.parentElement ?? document.body
            }
          />
        </div>
      )}
    >
      <Button
        ref={buttonRef}
        type="text"
        size="small"
        aria-label={`Move ${ruleName} to position`}
        icon={
          open ? (
            <IconChevronUp className="h-4 w-4" />
          ) : (
            <IconChevronDown className="h-4 w-4" />
          )
        }
      />
    </Dropdown>
  );
};
