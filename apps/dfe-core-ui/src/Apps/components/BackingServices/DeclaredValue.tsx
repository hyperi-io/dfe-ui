import { TDeclaredValue } from '@/Apps/hooks/backingServices/useFetchBackingServices/types';
import { Tooltip } from '@/core/components/Tooltip';
import { IconLock } from '@repo/dfe-icons';
import { Tag } from 'antd';

export const TIER_DEFAULT_LABEL = 'tier default';

/**
 * One declared value, framed by where it came from.
 *
 * A null `source` is not zero and not unset-meaning-nothing: it means the
 * deployment declared nothing and the chart or profile tier supplies the value.
 * The engine does not read those charts, so the number is genuinely unknown
 * here and is never rendered as one.
 */
export const DeclaredValue = ({ declared }: { declared: TDeclaredValue }) => {
  const isDeclared = declared.source != null;

  return (
    <span className="flex flex-wrap items-center gap-1">
      {isDeclared ? (
        <Tag className="font-mono">{String(declared.value)}</Tag>
      ) : (
        <Tooltip title="Set by the chart or profile tier, which the engine does not read.">
          <Tag>{TIER_DEFAULT_LABEL}</Tag>
        </Tooltip>
      )}
      {isDeclared && (
        <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs">
          {`declared in ${declared.source}`}
        </span>
      )}
      {declared.protected && (
        <Tooltip title="Locked by a governance policy. A holder of the override grant can still change it deliberately.">
          <Tag color="gold" icon={<IconLock className="inline size-3" />}>
            locked
          </Tag>
        </Tooltip>
      )}
    </span>
  );
};
