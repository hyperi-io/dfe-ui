'use client';

import { cn } from '@/core/utils/style';
import { IconArrowRight, IconLock } from '@repo/dfe-icons';
import { Tag, Tooltip } from 'antd';
import Link from 'next/link';

/** One labelled fact inside a stage box. */
export interface FlowStageDetail {
  label: string;
  value: string;
  /** Renders in the monospace face, for a topic, an endpoint or a field. */
  code?: boolean;
}

export interface FlowStageProps {
  /** Where in the flow this box sits, e.g. INPUT. */
  stage: string;
  /** What runs here - a match expression, an app, a table. */
  title: string;
  details?: FlowStageDetail[];
  /** Set where the engine derives this stage, so nothing here is editable. */
  engineOwned?: boolean;
  /** Where the stage is managed, when it has a page of its own. */
  href?: string;
  /** Set for a stage this source does not use, so it reads as absent. */
  absent?: boolean;
}

/**
 * One stage of a source's flow, drawn the same way wherever it appears.
 *
 * The source page, the default-flow card and the Stack apps tab all draw the
 * same three stages, so they draw them from here: a second copy would let two
 * screens disagree about what the resolver said.
 */
export const FlowStage = ({
  stage,
  title,
  details = [],
  engineOwned = false,
  href,
  absent = false,
}: FlowStageProps) => (
  <div
    className={cn(
      'flex min-w-0 flex-1 flex-col gap-2 rounded-md border border-solid p-3',
      'border-foreground/20 dark:border-dark-foreground/20',
      absent && 'opacity-50 border-dashed',
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs font-semibold uppercase tracking-wide">
        {stage}
      </span>
      {engineOwned && (
        <Tooltip title="Derived from this source, so it is read-only here">
          <Tag className="m-0 flex items-center gap-1" icon={<IconLock />}>
            engine-owned
          </Tag>
        </Tooltip>
      )}
    </div>

    <p className="m-0 break-words text-sm font-medium">
      {href ? <Link href={href}>{title}</Link> : title}
    </p>

    {details.length > 0 && (
      <dl className="m-0 grid grid-cols-[6rem_1fr] gap-x-2 gap-y-1 text-xs">
        {details.map((detail) => (
          <div key={detail.label} className="contents">
            <dt className="text-foreground/50 dark:text-dark-foreground/50">
              {detail.label}
            </dt>
            <dd
              className={cn('m-0 break-words', detail.code && 'font-mono')}
              title={detail.value}
            >
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    )}
  </div>
);

/**
 * What carries records from one stage to the next.
 *
 * The label is the deployment's answer - the bus provider or the direct
 * protocol - plus the topic or endpoint it lands on, never a string built from
 * a convention this component knows.
 */
export const FlowArrow = ({ label }: { label?: string }) => (
  <div
    className="flex shrink-0 flex-col items-center justify-center gap-1 px-1"
    aria-hidden={!label}
  >
    <IconArrowRight className="text-foreground/40 dark:text-dark-foreground/40" />
    {label && (
      <span className="text-foreground/50 dark:text-dark-foreground/50 max-w-28 break-words text-center font-mono text-[0.65rem]">
        {label}
      </span>
    )}
  </div>
);
