import { RbacProtected } from '@/core/components/RbacProtected';
import { SortableRuleList } from '@/Sources/components/SortableRuleList';
import { TRuleBlock } from '@/Sources/hooks/useFetchRuleBlocks/types';
import { BlockRow } from './BlockRow';

export const RbacOrderList = ({
  label,
  ordered,
  titleOf,
  isPending,
  onMove,
}: {
  label: string;
  ordered: TRuleBlock[];
  titleOf: (block: TRuleBlock) => string;
  isPending: boolean;
  onMove: (from: number, to: number) => void;
}) => {
  const { isAuthorized } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.source_write,
  });
  return (
    <SortableRuleList
      items={ordered}
      label={label}
      itemName={titleOf}
      disabled={!isAuthorized || isPending}
      onMove={onMove}
      renderItem={(block) => <BlockRow block={block} title={titleOf(block)} />}
    />
  );
};
