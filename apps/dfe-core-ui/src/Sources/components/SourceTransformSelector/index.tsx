'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { getApiErrorResponseBody } from '@/core/config/api/client';
import {
  APPS_QUERY_KEY,
  useFetchApps,
} from '@/core/hooks/apps/instances/useFetchApps';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { AppInstancePanels } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/AppInstancePanels';
import {
  buildTransformOptions,
  TransformOption,
} from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/transformApps';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { useUpdateSource } from '@/Sources/hooks/useUpdateSource';
import { TSourceUpdateResponse } from '@/Sources/hooks/useUpdateSource/types';
import { transformSourceFormDataToRequestBody } from '@/Sources/utils/transformSourceData/transformSourceFormDataToRequestBody';
import { transformSourceRequestBodyToFormData } from '@/Sources/utils/transformSourceData/transformSourceRequestBodyToFormData';
import { useQueryClient } from '@tanstack/react-query';
import { Radio, Tag } from 'antd';
import { useState } from 'react';
import { SwitchTransformModal } from './SwitchTransformModal';

/** The tag and the line under each option, for one option's state. */
const optionState = (
  option: TransformOption,
  { refusal, chosen }: { refusal?: string; chosen: boolean },
): { label: string; colour?: string; note: string } => {
  // The deployment decides how many of an app it can run, and it is the only
  // thing that knows: its refusal is quoted here rather than paraphrased.
  if (refusal) {
    return { label: 'Refused', colour: 'red', note: refusal };
  }
  if (option.selected) {
    return option.running
      ? { label: 'Selected', colour: 'green', note: 'Running for this source.' }
      : {
          label: 'Selected',
          colour: 'green',
          note: 'Starts when this source is deployed.',
        };
  }
  if (option.running) {
    return {
      label: 'Running',
      colour: 'orange',
      note: chosen
        ? 'Still carrying this source until the selected engine is deployed.'
        : 'Running for this source, though the source names no engine.',
    };
  }
  if (option.unavailable) {
    return { label: 'Unavailable', note: option.unavailable };
  }
  // A deployment that runs one of an app serves one source with it, and the
  // deploy says so. Naming the source it is on is what the refusal quotes.
  if (option.boundElsewhere.length > 0) {
    return {
      label: 'Available',
      note: `Already running for ${option.boundElsewhere.join(', ')}.`,
    };
  }
  return { label: 'Available', note: 'Ready to take this source.' };
};

/**
 * The one transform this source runs, chosen from the catalogued transforms.
 *
 * A source carries a single ``transform.engine``, so these are one choice and
 * not three deployments: the engine refuses an instance of a transform the
 * source does not name, and removes one the source stops naming. That makes the
 * source write the only way to move a source between transforms, which is why
 * this writes the source rather than deploying an app.
 *
 * dfe-fetcher is deliberately not here. It is a separate per-source app whose
 * own deploy and undeploy are real actions.
 */
export const SourceTransformSelector = ({
  source,
  sourceDetail,
  onSourceUpdated,
}: {
  source: string;
  sourceDetail?: TSourceVersionDetail;
  onSourceUpdated?: (response: TSourceUpdateResponse) => void;
}) => {
  const queryClient = useQueryClient();
  const [pendingEngine, setPendingEngine] = useState<string | null>(null);
  // An engine the deployment has already refused for this source, and its
  // words. Kept so the option is not offered a second time.
  const [refusals, setRefusals] = useState<Record<string, string>>({});
  // The same cached catalogue the Processing tab reads, so the apps it leaves
  // out of its own list are exactly the ones offered here.
  const { data: apps } = useFetchApps();

  const engine = sourceDetail?.version?.transform?.engine ?? null;
  const options = buildTransformOptions({ apps: apps ?? [], source, engine });
  const selected = options.find((option) => option.selected);
  const running = options.find((option) => option.running);
  const pending = options.find((option) => option.engine === pendingEngine);

  const { isAuthorized: canWriteSource } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.source_write,
  });

  const {
    mutate: updateSource,
    isPending,
    error,
    reset,
  } = useUpdateSource({
    onSuccess: (response) => {
      setPendingEngine(null);
      // The instance of a transform is derived from the source, so the
      // catalogue's instance list is stale the moment the source is written.
      void queryClient.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      onSourceUpdated?.(response);
    },
    onError: (refused) => {
      if (!pendingEngine) return;
      setRefusals((held) => ({
        ...held,
        [pendingEngine]:
          getApiErrorResponseBody(refused)?.message ?? refused.message,
      }));
    },
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 175,
  });

  const closeModal = () => {
    setPendingEngine(null);
    reset();
  };

  const confirmSwitch = () => {
    if (!sourceDetail || !pendingEngine) return;
    // The same round trip the edit drawer writes with, so this carries every
    // field that form carries rather than a body assembled a second way. The
    // form itself submits only its own fields; picking them here is what keeps
    // the identity and version keys out, which the engine refuses on a write.
    const written = transformSourceFormDataToRequestBody(
      transformSourceRequestBodyToFormData(sourceDetail),
    );
    updateSource({
      source: written.source,
      display_name: written.display_name,
      description: written.description,
      enabled: written.enabled,
      state: written.state,
      header: written.header,
      schema: written.schema,
      views: written.views,
      match: written.match,
      fetcher: written.fetcher,
      transport: written.transport,
      archive: written.archive,
      // variant names a compiled-in program of one app, so it cannot survive a
      // move to another.
      transform: { ...written.transform, engine: pendingEngine, variant: null },
    });
  };

  // An engine-owned source is rendered from the deployment, and every write
  // path refuses it, so the choice is shown and never offered.
  const engineOwned = sourceDetail?.resource_type === 'core';
  const switchDisabled = !canWriteSource || !sourceDetail || engineOwned;

  // A deployment whose manifest catalogues no transform has no choice to offer,
  // and the Processing tab says so for the per-source apps as a whole.
  if (options.length === 0) return null;

  return (
    <CustomScrollbar height={componentHeight}>
      <SectionCard
        title={
          <h2 className="text-foreground-muted dark:text-dark-foreground-muted text-base font-semibold">
            Transform
          </h2>
        }
        description={
          engineOwned
            ? 'One transform per source. This source is engine-owned, so its choice is read-only here.'
            : 'One transform per source. Choosing another replaces the one that runs here.'
        }
      >
        <Radio.Group
          value={engine}
          disabled={switchDisabled}
          onChange={(event) => setPendingEngine(event.target.value)}
          className="w-full"
        >
          <div className="flex w-full flex-col gap-2">
            {options.map((option) => {
              const refusal = refusals[option.engine];
              const state = optionState(option, {
                refusal,
                chosen: selected !== undefined,
              });
              return (
                <div
                  key={option.service}
                  className={cn(
                    'rounded-md border px-3 py-2',
                    option.selected && 'border-success/50 bg-success/10',
                    !option.selected &&
                      refusal &&
                      'border-error/50 bg-error/10 dark:border-dark-error',
                    !option.selected &&
                      !refusal &&
                      'border-foreground/20 dark:border-dark-foreground/20',
                  )}
                >
                  <Radio
                    value={option.engine}
                    disabled={
                      switchDisabled ||
                      option.unavailable !== null ||
                      refusal !== undefined
                    }
                    className={cn(
                      'm-0 flex w-full items-start',
                      '[&>span:last-child]:min-w-0 [&>span:last-child]:flex-1',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <span className="break-all font-medium">
                        {option.service}
                      </span>
                      <Tag color={state.colour} className="m-0">
                        {state.label}
                      </Tag>
                    </div>
                    {/* Clamped: an engine refusal runs to four lines, and one row
                      three times the height of its neighbours is what makes a
                      list of options read as a pile. The whole message is on
                      the element, and the dialog carries it in full. */}
                    <p
                      title={refusal}
                      className="text-foreground/60 dark:text-dark-foreground/60 mt-1 line-clamp-2 text-xs"
                    >
                      {state.note}
                    </p>
                  </Radio>
                </div>
              );
            })}
          </div>
        </Radio.Group>

        {!engine && (
          <NotificationCard
            type="info"
            variant="subtle"
            title="This source has no transform"
            description="Records reach the loader as they arrived. Choose an engine to transform them first."
          />
        )}

        {/* The instance that EXISTS, which is the selected engine's once the two
          agree. Until they do -- a switch not yet deployed, or a deployment
          holding an instance the source does not name -- the outgoing app is
          the one still carrying records, so its files and health stay here. */}
        {running && <AppInstancePanels app={running.app} instance={source} />}

        <SwitchTransformModal
          open={pending !== undefined}
          source={source}
          from={selected?.service ?? null}
          to={pending?.service ?? null}
          isPending={isPending}
          // Once the deployment has refused this engine, repeating the write only
          // repeats the refusal.
          refused={pendingEngine !== null && pendingEngine in refusals}
          error={getApiErrorResponseBody(error)?.message ?? error?.message}
          onConfirm={confirmSwitch}
          onCancel={closeModal}
        />
      </SectionCard>
    </CustomScrollbar>
  );
};
