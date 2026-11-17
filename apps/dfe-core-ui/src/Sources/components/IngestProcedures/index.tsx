import { NotificationCard } from '@/core/components/NotificationCard';
import { RuleOrderList } from './RuleOrderList';

import { GenericErrorCard } from '@/core/components/GenericError';
import { DeploymentCompatibility } from '@/Sources/components/IngestRules/DeploymentCompatibility';
import { useFetchCompatProfiles } from '@/Sources/hooks/useFetchCompatProfiles';
import { useFetchRuleBlocks } from '@/Sources/hooks/useFetchRuleBlocks';
import {
  TRuleBlock,
  TRuleTarget,
} from '@/Sources/hooks/useFetchRuleBlocks/types';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Spin } from 'antd';

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

export const IngestProcedures = () => {
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
    <div className="flex flex-col gap-4">
      <NotificationCard
        type="info"
        title="Rule order"
        description="The order the receiver's rules run in, and the compatibility profiles they include. Moving a block changes which rule a record meets first. A save reaches the receiver without a restart."
      />
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

      <div className="grid grid-cols-2 gap-12">
        {data ? (
          <RuleOrderList
            componentHeight={{
              initialOffset: 250,
            }}
            title={TARGETS[0].title}
            description={TARGETS[0].description}
            key={TARGETS[0].target}
            target={TARGETS[0].target}
            blocks={data?.blocks.filter(
              (block) => block.target === TARGETS[0].target,
            )}
            etag={data.etag}
            titleOf={titleOf}
            nameOf={nameOf}
            onReload={refetch}
            isReloading={isFetching}
          />
        ) : (
          <div />
        )}

        <div className="flex flex-col gap-2">
          <DeploymentCompatibility />
          {data ? (
            <RuleOrderList
              componentHeight={{
                initialOffset: 450,
              }}
              title={TARGETS[1].title}
              description={TARGETS[1].description}
              key={TARGETS[1].target}
              target={TARGETS[1].target}
              blocks={data?.blocks.filter(
                (block) => block.target === TARGETS[1].target,
              )}
              etag={data.etag}
              titleOf={titleOf}
              nameOf={nameOf}
              onReload={refetch}
              isReloading={isFetching}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
