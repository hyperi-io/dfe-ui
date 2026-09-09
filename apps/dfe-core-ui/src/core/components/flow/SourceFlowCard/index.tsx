'use client';

import { FlowArrow, FlowStage } from '@/core/components/flow/FlowStage';
import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchSourceFlow } from '@/core/hooks/sources/useFetchSourceFlow';
import { Spin } from 'antd';
import { Fragment } from 'react';
import { flowStages } from './flowStages';

const Heading = ({ title }: { title: string }) => (
  <h2 className="text-foreground-muted dark:text-dark-foreground-muted text-base font-semibold">
    {title}
  </h2>
);

/**
 * Where a source's records come in, what shapes them, and where they land.
 *
 * Read from the engine's flow resolver rather than the source's own fields: the
 * resolver is what the compilers write the deployed config from, so this is the
 * same answer the running stack was configured with.
 */
export const SourceFlowCard = ({
  source,
  title = 'Flow',
  description,
}: {
  source: string;
  title?: string;
  description?: string;
}) => {
  const {
    data: flow,
    isLoading,
    refusal,
    error,
  } = useFetchSourceFlow({ source });

  if (isLoading) {
    return (
      <SectionCard title={<Heading title={title} />} description={description}>
        <Spin size="small" />
      </SectionCard>
    );
  }

  // The engine's own words: it names the stage that refused and why, and the
  // console has nothing more accurate to say than that.
  if (refusal) {
    return (
      <SectionCard title={<Heading title={title} />} description={description}>
        <NotificationCard
          type="warning"
          title="This flow cannot run as configured"
          description={refusal}
        />
      </SectionCard>
    );
  }

  if (error || !flow) {
    return (
      <SectionCard title={<Heading title={title} />} description={description}>
        <NotificationCard
          type="info"
          variant="subtle"
          title="The flow is not readable"
          description={error?.message}
        />
      </SectionCard>
    );
  }

  const { stages, arrows } = flowStages(flow);

  return (
    <SectionCard title={<Heading title={title} />} description={description}>
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {stages.map((stage, index) => (
          <Fragment key={stage.stage}>
            {index > 0 && <FlowArrow label={arrows[index - 1]} />}
            <FlowStage {...stage} />
          </Fragment>
        ))}
      </div>
    </SectionCard>
  );
};
