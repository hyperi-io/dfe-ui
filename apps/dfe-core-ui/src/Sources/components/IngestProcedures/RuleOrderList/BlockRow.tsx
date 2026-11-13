import { Tooltip } from '@/core/components/Tooltip';
import { TRuleBlock } from '@/Sources/hooks/useFetchRuleBlocks/types';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Tag } from 'antd';
import Link from 'next/link';
import { KIND_LABEL } from './RuleOrderList.helpers';

export const BlockRow = ({
  block,
  title,
}: {
  block: TRuleBlock;
  title: string;
}) => {
  const rows = block.rules.length;
  const warnings = block.warnings ?? [];
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      {block.kind === 'source' ? (
        <Link
          href={`/sources?source_name=${encodeURIComponent(block.name)}`}
          className="truncate font-medium text-foreground! hover:text-tertiary! dark:text-dark-foreground!"
        >
          {title}
        </Link>
      ) : (
        <span className="truncate font-medium">{title}</span>
      )}
      {block.kind !== 'default' && (
        <Tag className="m-0" variant="filled">
          {KIND_LABEL[block.kind]}
        </Tag>
      )}
      {block.version && (
        <span className="text-xs text-foreground/50 dark:text-dark-foreground/50">
          {`version ${block.version}`}
        </span>
      )}
      {!block.compiled && (
        <Tag className="m-0" color="warning">
          Not in the receiver&apos;s rules
        </Tag>
      )}
      {warnings.length > 0 && (
        <Tooltip
          title={
            <ul className="m-0 list-disc pl-4">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          }
        >
          <span
            role="img"
            aria-label={`${warnings.length} warning${warnings.length > 1 ? 's' : ''}: ${warnings.join(' ')}`}
            className="flex text-warning"
          >
            <IconAlertTriangle className="h-4 w-4" />
          </span>
        </Tooltip>
      )}
      <span className="ml-auto text-xs text-foreground/50 dark:text-dark-foreground/50">
        {block.kind === 'default'
          ? 'Takes what no block above matched'
          : `${rows} rule row${rows === 1 ? '' : 's'}`}
      </span>
    </div>
  );
};
