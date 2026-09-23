import { Tooltip } from '@/core/components/Tooltip';
import { Tag } from 'antd';
import { ReactNode } from 'react';

/** What a blank field resolves to, as a blank field shows it. */
export const dfeDefaultText = (value: string | number | undefined) =>
  value === undefined ? undefined : `${value} (DFE default)`;

/** A TTL in days as shown, where 0 means no TTL. */
export const ttlDaysText = <T extends number | null | undefined>(days: T) =>
  days === 0 ? 'Forever' : days;

/** Marks a value set on the source itself, which the DFE default no longer replaces. */
export const OverrideTag = () => (
  <Tooltip
    destroyOnHidden
    title="Set on this source. Clear it to follow the DFE default."
  >
    <Tag className="m-0" color="blue">
      Override
    </Tag>
  </Tooltip>
);

/** A value the source may set, or the DFE default it falls back to when it does not. */
export const DefaultOrOverride = ({
  defaultValue,
  value,
}: {
  defaultValue: string | number | undefined;
  value: ReactNode;
}) => {
  const isSet = value !== undefined && value !== null && value !== '';
  if (isSet) {
    return (
      <span className="flex items-center gap-2">
        {value}
        <OverrideTag />
      </span>
    );
  }
  return (
    <span className="text-foreground/40 dark:text-dark-foreground/40">
      {dfeDefaultText(defaultValue) ?? 'DFE default'}
    </span>
  );
};
