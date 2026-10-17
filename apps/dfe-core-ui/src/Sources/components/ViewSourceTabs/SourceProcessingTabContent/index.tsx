'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { useFetchApps } from '@/core/hooks/apps/instances/useFetchApps';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { SourceAppInstance } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/SourceAppInstance';
import { SourceRoutingCard } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/SourceRoutingCard';
import { isTransformApp } from '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/transformApps';
import { TAppCatalogueEntry } from '@/core/hooks/apps/instances/useFetchApps/types';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { Spin } from 'antd';
import { ReactNode } from 'react';

/**
 * Whether a per-source app takes a source polling `sourceType`, which is unset
 * for a receiver source. An app declaring `source_types` polls only those
 * families, and one declaring none is not tied to how a source arrives.
 */
const takesSource = (
  app: TAppCatalogueEntry,
  sourceType: string | null | undefined,
): boolean =>
  app.source_types?.length
    ? !!sourceType && app.source_types.includes(sourceType)
    : true;

/**
 * Everything that processes THIS source, in the order its records meet it:
 * where they arrive, then the transform.
 *
 * A receiver source arrives through the receiver's rule for it, shown here and
 * on Components by design: the rule belongs to the source, the pool to the
 * fleet. A fetcher source arrives through its own fetcher and never passes the
 * receiver, so it gets no routing card.
 */
export const SourceProcessingTabContent = ({
  source,
  transformSlot,
}: {
  source: string;
  /**
   * The transform choice, rendered where the transform apps would be listed.
   *
   * Choosing a transform writes the SOURCE, which belongs to the Sources scope,
   * so the control is passed in rather than reached for from here.
   */
  transformSlot?: ReactNode;
}) => {
  const { data: apps, isLoading, error } = useFetchApps();
  const { originType, sourceDetail, isLoadingSourceDetail } =
    useSourceDetailsContext();

  // The source detail chrome ends 260px down and the page clips 45px short of
  // the window, so an offset under 305 leaves the last rows unreachable.
  const { componentHeight } = useSetComponentHeight({
    offset: 320,
  });

  // Every card below is placed by the source's origin, so none is guessed before it is known.
  if (isLoading || isLoadingSourceDetail) return <Spin size="small" />;

  if (error || !apps) {
    return (
      <NotificationCard
        type="error"
        title="Could not read the app catalogue"
        description={error?.message}
      />
    );
  }

  // Multiplicity decides where an app belongs: a single deployment serves
  // every source, a per-config one is this source's own.
  const singleApps = apps.filter((app) => app.multiplicity === 'single');
  const perSourceApps = apps.filter((app) => app.multiplicity === 'per_config');
  // The transforms are one choice, not several deployments, so they are lifted
  // out of the per-app list into the control that writes that choice.
  const standaloneApps = originType
    ? perSourceApps.filter(
        (app) =>
          !isTransformApp(app) &&
          takesSource(app, sourceDetail?.version?.fetcher?.source_type),
      )
    : [];

  return (
    <CustomScrollbar height={componentHeight} className="flex flex-col">
      {originType === 'receiver' &&
        singleApps.flatMap((app) =>
          app.instances.map((instance) => (
            <SourceRoutingCard
              key={`${app.service}/${instance}`}
              service={app.service}
              instance={instance}
              source={source}
              hasCompiledRouting={app.has_compiled_routing}
            />
          )),
        )}

      {standaloneApps.map((app) => (
        <SourceAppInstance key={app.service} app={app} source={source} />
      ))}

      {transformSlot}

      {perSourceApps.length === 0 && (
        <NotificationCard
          type="info"
          variant="subtle"
          title="No per-source apps are available"
          description="This deployment offers none, so there is nothing to deploy against this source."
        />
      )}
    </CustomScrollbar>
  );
};
