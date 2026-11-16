import { Tooltip } from '@/core/components/Tooltip';
import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { Tag } from 'antd';

interface HuntStateTagProps {
  enabled?: boolean | null;
  autoDisabledAt?: number | null;
  autoDisabledReason?: string | null;
  className?: string;
}

/** A tag for a hunt the runner is not firing, and nothing for one it is. */
export const HuntStateTag = ({
  enabled,
  autoDisabledAt,
  autoDisabledReason,
  className,
}: HuntStateTagProps) => {
  if (autoDisabledAt != null) {
    const reason = autoDisabledReason ? ` (${autoDisabledReason})` : '';
    return (
      <Tooltip
        title={`Stopped ${formatEpochSecondsLocal(autoDisabledAt)} after repeated ClickHouse resource-limit failures${reason}. Re-enable the hunt to clear it.`}
      >
        <Tag color="warning" className={className}>
          Auto-disabled
        </Tag>
      </Tooltip>
    );
  }

  if (enabled === false) {
    return (
      <Tooltip title="This hunt fires nothing. Its configuration, state and watermark are kept.">
        <Tag className={className}>Disabled</Tag>
      </Tooltip>
    );
  }

  return null;
};
