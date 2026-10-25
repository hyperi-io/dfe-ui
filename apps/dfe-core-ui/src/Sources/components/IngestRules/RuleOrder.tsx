'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { Tooltip } from '@/core/components/Tooltip';
import { SortableRuleList } from '@/Sources/components/SortableRuleList';
import { useFetchCompatProfiles } from '@/Sources/hooks/useFetchCompatProfiles';
import { useFetchRuleBlocks } from '@/Sources/hooks/useFetchRuleBlocks';
import {
  TRuleBlock,
  TRuleTarget,
} from '@/Sources/hooks/useFetchRuleBlocks/types';
import { useReorderRuleBlocks } from '@/Sources/hooks/useReorderRuleBlocks';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button, Spin, Tag } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IngestWriteRefusal } from './IngestWriteRefusal';
import { IngestWriteResult } from './IngestWriteResult';

const TARGETS: { target: TRuleTarget; title: string; description: string }[] = [
  {
    target: '_source',
    title: 'Source rules',
    description:
      'Which source a record belongs to. The receiver tries each block from the top, and the first that matches decides.',
  },
  {
    target: '_org_id',
    title: 'Org rules',
    description:
      'Which org a record belongs to, tried the same way once its source is known.',
  },
];

const KIND_LABEL: Record<TRuleBlock['kind'], string> = {
  source: 'Source',
  profile: 'Compatibility profile',
  default: 'Default',
};

const moveId = (ids: string[], from: number, to: number) => {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
};

const sameOrder = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((id, index) => id === right[index]);

const BlockRow = ({ block, title }: { block: TRuleBlock; title: string }) => {
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
        <Tag className="m-0" bordered={false}>
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

/** One field's blocks: a draft order the user edits, saved against the revision it was read at. */
const RuleOrderList = ({
  target,
  title,
  description,
  blocks,
  etag,
  titleOf,
  nameOf,
  onReload,
  isReloading,
}: {
  target: TRuleTarget;
  title: string;
  description: string;
  blocks: TRuleBlock[];
  etag: string | null;
  titleOf: (block: TRuleBlock) => string;
  nameOf: (id: string) => string;
  onReload: () => Promise<unknown>;
  isReloading: boolean;
}) => {
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

      {movable.length === 0 && (
        <p className="m-0 text-sm text-foreground/60 dark:text-dark-foreground/60">
          No block here can move: only the default runs.
        </p>
      )}

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

      {isDirty && (
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-sm text-foreground/60 dark:text-dark-foreground/60">
            {etag
              ? 'This order is not saved yet.'
              : 'The engine sent no revision this console can read, so the order cannot be saved.'}
          </span>
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
      )}
    </section>
  );
};

/** The list itself: editable for a writer, read only for everyone else. */
const RbacOrderList = ({
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

/**
 * The receiver's rule blocks, each field's in the order they run.
 *
 * Each source is one block, each bound compatibility profile another, and the
 * default sits pinned last. A move is a draft until saved, and a save names
 * every movable block of its field, so the engine can refuse one written
 * against a list that has since changed.
 */
export const RuleOrder = () => {
  const { data, isLoading, isFetching, error, refetch } = useFetchRuleBlocks();
  const { profiles } = useFetchCompatProfiles();

  const titleOf = (block: TRuleBlock) => {
    if (block.kind === 'default') return 'Default';
    if (block.kind === 'profile') {
      return (
        profiles?.find((profile) => profile.id === block.name)?.title ??
        block.name
      );
    }
    return block.name;
  };

  // Ids are source.<name>, compat.<profile> or default, and a refusal can name one this page has not read.
  const nameOf = (id: string) => {
    const [kind, ...rest] = id.split('.');
    const name = rest.join('.');
    if (kind === 'source') return name;
    if (kind === 'compat') {
      return profiles?.find((profile) => profile.id === name)?.title ?? name;
    }
    return id === 'default' ? 'Default' : id;
  };

  return (
    <SectionCard
      title={<h2 className="m-0 text-base font-semibold">Rule order</h2>}
      description="Moving a block changes which rule a record meets first. A save reaches the receiver without a restart."
    >
      {isLoading && (
        <>
          <Spin /> <span className="sr-only">Loading rule blocks</span>
        </>
      )}
      {error && (
        <GenericErrorCard
          title="The rule blocks could not be read"
          description={error.message}
        />
      )}
      {data && !data.etag && (
        <NotificationCard
          type="warning"
          icon={<IconAlertTriangle />}
          title="This order is read only here"
          description="The engine answered without a revision the browser may read, which a save has to send back. The console reaches the engine on another origin that does not expose the ETag header."
        />
      )}
      {data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {TARGETS.map(({ target, title, description }) => (
            <RuleOrderList
              key={target}
              target={target}
              title={title}
              description={description}
              blocks={data.blocks.filter((block) => block.target === target)}
              etag={data.etag}
              titleOf={titleOf}
              nameOf={nameOf}
              onReload={refetch}
              isReloading={isFetching}
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
};
