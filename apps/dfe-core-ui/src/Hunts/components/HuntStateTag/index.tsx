import { Tooltip } from '@/core/components/Tooltip';
import { useTheme } from '@/core/contexts/ClientContext/ThemeContext';
import { colors } from '@/core/utils/theme';
import { autoDisableNotice } from '@/Hunts/utils/autoDisable';
import { Tag } from 'antd';

interface HuntStateTagProps {
  enabled?: boolean | null;
  autoDisabledAt?: number | null;
  autoDisabledReason?: string | null;
  className?: string;
}

/** A tag for a hunt the hunt runner is not firing, and nothing for one it is. */
export const HuntStateTag = ({
  enabled,
  autoDisabledAt,
  autoDisabledReason,
  className,
}: HuntStateTagProps) => {
  const { colorMode } = useTheme();
  if (autoDisabledAt != null) {
    return (
      <Tooltip
        title={`${autoDisableNotice(autoDisabledAt, autoDisabledReason)} Use Re-enable Hunt to start it again.`}
      >
        <Tag
          color="warning"
          className={className}
          // Ant's warning text reads at 1.83:1 on the tag in light. Dark reads at 6.24:1 as shipped.
          style={
            colorMode === 'light'
              ? { color: colors.semantic.warningOnLight }
              : undefined
          }
        >
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
