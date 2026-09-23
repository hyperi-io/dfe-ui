'use client';

import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { IconArrowRight, IconLock } from '@repo/dfe-icons';
import { Tag } from 'antd';
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
    data-testid={`flow-stage-${stage.toLowerCase()}`}
    className={cn(
      'flex min-w-0 flex-1 flex-col gap-2 rounded-md border border-solid p-3',
      'border-foreground/20 dark:border-dark-foreground/20',
      absent && 'opacity-50 border-dashed',
    )}
  >
    <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs font-semibold uppercase tracking-wide">
      {stage}
    </span>

    <p className="m-0 break-words text-sm font-medium">
      {href ? <Link href={href}>{title}</Link> : title}
    </p>

    {details.length > 0 && (
      /* The label column sizes to the labels and the value track may shrink to
         nothing: a fixed column squeezed the value until it broke mid-phrase
         and painted past the card's right edge. */
      <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-xs">
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

    {engineOwned && (
      <Tooltip title="Derived from this source, so it is read-only here">
        {/* Along the bottom of the card, so a badge on one stage cannot push
            its title out of line with the stages either side. */}
        <Tag
          className="m-0 mt-auto flex w-fit items-center gap-1"
          icon={<IconLock />}
        >
          engine-owned
        </Tag>
      </Tooltip>
    )}
  </div>
);

/**
 * The edge between two stages: a drawn line into an arrowhead.
 *
 * What carries records - the bus provider or the direct protocol - plus the
 * topic or endpoint they land on is the edge's accessible name and its
 * tooltip. The stage the edge points at already states both, so drawing them
 * again between the cards only put text in no box at all (dfe-ui#339).
 */
export const FlowArrow = ({ label }: { label?: string }) => (
  <div
    className="flex shrink-0 items-center justify-center self-center @2xl:self-stretch"
    role={label ? 'img' : undefined}
    aria-label={label ? `Carried on ${label}` : undefined}
    aria-hidden={label ? undefined : true}
    title={label}
  >
    {/* The stages stack below the container width, so the edge turns with them. */}
    <span className="flex rotate-90 items-center @2xl:rotate-0">
      <span className="bg-foreground/25 dark:bg-dark-foreground/25 h-px w-6" />
      <IconArrowRight className="text-foreground/40 dark:text-dark-foreground/40 -ml-1.5" />
    </span>
  </div>
);
