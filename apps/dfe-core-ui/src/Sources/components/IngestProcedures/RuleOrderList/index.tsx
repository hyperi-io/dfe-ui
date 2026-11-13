'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IngestWriteRefusal } from '@/Sources/components/IngestRules/IngestWriteRefusal';
import { IngestWriteResult } from '@/Sources/components/IngestRules/IngestWriteResult';
import {
  TRuleBlock,
  TRuleTarget,
} from '@/Sources/hooks/useFetchRuleBlocks/types';
import { useReorderRuleBlocks } from '@/Sources/hooks/useReorderRuleBlocks';
import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { RbacOrderList } from './RbacOrderList';
import { moveId, sameOrder } from './RuleOrderList.helpers';

interface RuleOrderListProps {
  target: TRuleTarget;
  title: string;
  description: string;
  blocks: TRuleBlock[];
  etag: string | null;
  titleOf: (block: TRuleBlock) => string;
  nameOf: (id: string) => string;
  onReload: () => Promise<unknown>;
  isReloading: boolean;
  componentHeight?: {
    initialOffset: number;
  };
}

export const RuleOrderList = ({
  target,
  title,
  description,
  blocks,
  etag,
  titleOf,
  nameOf,
  onReload,
  isReloading,
  componentHeight: componentHeightProp = {
    initialOffset: 0,
  },
}: RuleOrderListProps) => {
  const serverIds = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const { mutate, isPending, error, reset, data } = useReorderRuleBlocks({
    etag,
    onSuccess: () => setDraft(null),
  });

  // A draft only stands while it names the blocks the engine has.
  const draftIds =
    draft &&
    draft.length === serverIds.length &&
    draft.every((id) => serverIds.includes(id))
      ? draft
      : serverIds;
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const ordered = draftIds
    .map((id) => byId.get(id))
    .filter((block): block is TRuleBlock => !!block);
  const isDirty = !sameOrder(draftIds, serverIds);
  const movable = ordered.filter((block) => !block.pinned);

  const handleReload = () => {
    void onReload().then(() => {
      setDraft(null);
      reset();
    });
  };

  const handleSave = () => {
    const ids = movable.map((block) => block.id);
    setSentIds(ids);
    mutate({ target, blocks: ids });
  };

  const dirtyHeightOffset = isDirty ? 50 : 0;
  const errorHeightOffset = error ? 100 : 0;
  const resultHeightOffset = data && !isDirty ? 62 : 0;

  const { componentHeight } = useSetComponentHeight({
    offset:
      componentHeightProp?.initialOffset +
      dirtyHeightOffset +
      errorHeightOffset +
      resultHeightOffset,
  });
  return (
    <section
      aria-labelledby={`rule-order-${target}`}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h3 id={`rule-order-${target}`} className="m-0 text-sm font-semibold">
          {title}
        </h3>
        <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
          {description}
        </p>
      </div>

      {isDirty && (
        <NotificationCard
          type="info"
          description={
            etag
              ? 'This order is not saved yet.'
              : 'The engine sent no revision this console can read, so the order cannot be saved.'
          }
          action={
            <div className="flex items-center justify-end gap-2">
              <Button
                onClick={() => {
                  setDraft(null);
                  reset();
                }}
                disabled={isPending}
              >
                Discard
              </Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={isPending}
                disabled={!etag}
              >
                Save order
              </Button>
            </div>
          }
        />
      )}

      {error ? (
        <IngestWriteRefusal
          error={error}
          sentIds={sentIds}
          nameOf={nameOf}
          onReload={handleReload}
          isReloading={isReloading}
        />
      ) : (
        data &&
        !isDirty && <IngestWriteResult result={data} savedWhat="Order" />
      )}

      {movable.length === 0 && (
        <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
          No block here can move: only the default runs.
        </p>
      )}

      <CustomScrollbar height={componentHeight}>
        <RbacOrderList
          label={`${title} order`}
          ordered={ordered}
          titleOf={titleOf}
          isPending={isPending}
          onMove={(from, to) => {
            reset();
            setDraft(moveId(draftIds, from, to));
          }}
        />
      </CustomScrollbar>
    </section>
  );
};
