import type { FlowStageProps } from '@/core/components/flow/FlowStage';
import type { TSourceFlow } from '@/core/hooks/sources/useFetchSourceFlow/types';

/** Where a source's per-source app instances are managed. */
const appPath = (service: string, instance: string) =>
  `/components?service=${encodeURIComponent(service)}&instance=${encodeURIComponent(instance)}`;

/** The label on an arrow: what carries the records, and what they land on. */
const carriedOn = (flow: TSourceFlow, target: string | null) =>
  target ? `${flow.carrier} ${target}` : flow.carrier;

/**
 * The three stages of a flow, and the two arrows between them.
 *
 * Every value comes off the resolver's answer. Nothing here rebuilds a topic
 * name or an endpoint from the naming convention: the console would then be a
 * second implementation of it, free to disagree with the compiled config.
 */
export const flowStages = (
  flow: TSourceFlow,
): { stages: FlowStageProps[]; arrows: (string | undefined)[] } => {
  const transform = flow.transform;

  const input: FlowStageProps = {
    stage: 'Input',
    title:
      flow.origin === 'fetcher' ? flow.input : `Receiver match: ${flow.input}`,
    details: [
      { label: 'Origin', value: flow.origin },
      { label: 'Transport', value: `${flow.transport} (${flow.carrier})` },
    ],
    engineOwned: flow.origin === 'fetcher',
    href:
      flow.origin === 'fetcher'
        ? appPath('dfe-fetcher', flow.source)
        : undefined,
  };

  const transformStage: FlowStageProps = transform
    ? {
        stage: 'Transform',
        title: transform.instance,
        details: [
          { label: 'App', value: transform.app, code: true },
          ...(transform.variant
            ? [{ label: 'Variant', value: transform.variant, code: true }]
            : []),
          ...(transform.endpoint
            ? [{ label: 'Endpoint', value: transform.endpoint, code: true }]
            : []),
          ...(transform.topics
            ? [
                { label: 'Reads', value: transform.topics[0], code: true },
                { label: 'Writes', value: transform.topics[1], code: true },
              ]
            : []),
        ],
        engineOwned: true,
        href: appPath(transform.app, flow.source),
      }
    : {
        stage: 'Transform',
        title: 'None - records reach the loader as they arrived',
        absent: true,
      };

  const output: FlowStageProps = {
    stage: 'Output',
    title: flow.table,
    details: [
      { label: 'Loader', value: flow.outputs.loader, code: true },
      { label: 'Archive', value: flow.outputs.archive ? 'kept' : 'not kept' },
    ],
  };

  // The first arrow carries records into the transform where there is one, and
  // straight to the loader where there is not.
  const toTransform = transform
    ? carriedOn(flow, transform.endpoint ?? transform.topics?.[0] ?? null)
    : undefined;
  const toLoader = carriedOn(flow, flow.outputs.loader);

  return {
    stages: [input, transformStage, output],
    arrows: [toTransform, toLoader],
  };
};
