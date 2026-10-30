import { IconSearch, IconSearchOff } from '@repo/dfe-icons';
import { cn } from '@repo/dfe-shared-ui';
import { Button, Input } from 'antd';
import { type ComponentProps, useState } from 'react';

type SearchProps = ComponentProps<typeof Input.Search>;
type SearchClassNames = Exclude<
  NonNullable<SearchProps['classNames']>,
  (...args: never[]) => unknown
>;

type CollapsibleSearchInputClassNames = SearchClassNames & {
  container?: string;
  trigger?: string;
};

interface CollapsibleSearchInputProps extends Omit<SearchProps, 'classNames'> {
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  classNames?: CollapsibleSearchInputClassNames;
}
export const CollapsibleSearchInput = ({
  defaultCollapsed = false,
  onCollapseChange,
  classNames,
  size,
  ...props
}: CollapsibleSearchInputProps) => {
  const {
    container: containerClassName,
    trigger: triggerClassName,
    ...inputClassNames
  } = classNames || {};
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleCollapseChange = () => {
    setCollapsed(!collapsed);
    onCollapseChange?.(collapsed);
  };

  return (
    <div className={cn('flex items-center gap-2', containerClassName)}>
      <Button
        className={cn(triggerClassName)}
        icon={collapsed ? <IconSearch /> : <IconSearchOff />}
        onClick={handleCollapseChange}
        size={size}
        aria-label="Toggle search"
        aria-expanded={!collapsed}
        shape="circle"
      />
      {!collapsed && (
        <Input.Search
          placeholder="Search"
          {...props}
          classNames={inputClassNames}
          size={size}
        />
      )}
    </div>
  );
};
