import { NotificationCard } from '@/core/components/NotificationCard';
import { TBulkActionSourcesRequestBody } from '@/core/hooks/useBulkActionSources/types';
import { TApplyDefaultsResponse } from '@/Platform/hooks/system/useApplyDefaults/types';
import { useFetchInfiniteDefaultsDriftSources } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources';
import { Spin, Steps, StepsProps } from 'antd';
import { useEffect, useState } from 'react';
import { BuildDeployTab } from './BuildDeployTab';
import { ConfigDriftTab } from './ConfigDriftTab';
import { LiveApplyResult, TLiveApply } from './LiveApplyResult';

type CurrentStep = 'config-drift' | 'build-deploy';

const steps: StepsProps['items'] = [
  {
    key: 'config-drift',
    title: 'Identify & Apply',
  },
  {
    key: 'build-deploy',
    title: 'Deploy',
  },
];

const formatNotificationCardTitleAndDescription = (step: CurrentStep) => {
  switch (step) {
    case 'build-deploy':
      return {
        title: 'Source Configs Updated',
        description:
          'The following sources have been updated. Please select which sources you would like to deploy.',
      };
    case 'config-drift':
    default:
      return {
        title: 'Config Drift Identified',
        description:
          'Configuration drift has been identified for sources in your environment. Applying defaults pins them in each source and alters the deployed table where it can: TTL moves and missing header columns are added straight away. An engine change needs a table rebuild, and the result below says so. Apply pins all four values on each selected source, including any it was inheriting, so later default changes stop moving it.',
      };
  }
};

const appliedDefaultsMessage = (
  updated: TApplyDefaultsResponse['updated'],
  unchanged: TApplyDefaultsResponse['unchanged'],
) => {
  return `Applied ${updated.length} defaults and ${unchanged.length} unchanged`;
};

export const IdentifyConfigDriftTabs = ({
  onSuccess,
  onPendingDeployCountChange,
}: {
  onSuccess?: () => void;
  onPendingDeployCountChange?: (count: number) => void;
}) => {
  const [currentStep, setCurrentStep] = useState<CurrentStep>('config-drift');
  const [appliedSources, setAppliedSources] = useState<
    TBulkActionSourcesRequestBody['sources']
  >([]);
  const [unchangedSources, setUnchangedSources] = useState<
    TBulkActionSourcesRequestBody['sources']
  >([]);

  // Latest result per source, so a second Apply replaces what the first reported.
  const [liveResults, setLiveResults] = useState<TLiveApply[]>([]);

  const [appliedSuccessMessage, setAppliedSuccessMessage] =
    useState<string>('');

  const buildDeployUnlocked = appliedSources.length > 0;

  useEffect(() => {
    onPendingDeployCountChange?.(appliedSources.length);
  }, [appliedSources.length, onPendingDeployCountChange]);

  const handleConfigDriftSuccess = (sources: TApplyDefaultsResponse) => {
    const nextAppliedSources = [...appliedSources, ...sources.updated];
    const nextUnchangedSources = [...unchangedSources, ...sources.unchanged];

    setAppliedSources(nextAppliedSources);
    setUnchangedSources(nextUnchangedSources);
    const reported = new Set(sources.live.map((entry) => entry.source));
    setLiveResults((previous) => [
      ...previous.filter((entry) => !reported.has(entry.source)),
      ...sources.live,
    ]);
    const message = appliedDefaultsMessage(
      nextAppliedSources,
      nextUnchangedSources,
    );
    setAppliedSuccessMessage(message);
    if (nextAppliedSources.length >= 1) {
      setCurrentStep('build-deploy');
    }
  };

  const handleStepChange = (stepIndex: number) => {
    const nextStep = steps[stepIndex]?.key;
    if (nextStep === 'build-deploy' && !buildDeployUnlocked) {
      return;
    }
    if (nextStep === 'config-drift' || nextStep === 'build-deploy') {
      setCurrentStep(nextStep);
    }
  };

  const {
    data: { items: defaultsDriftSources } = {},
    isLoading,
    error,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteDefaultsDriftSources();

  if (error) {
    return <NotificationCard type="error" title={error.message} />;
  }

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading defaults drift sources</p>
      </>
    );
  }

  const hasDriftSources = (defaultsDriftSources?.length ?? 0) > 0;
  const renderNotFound =
    defaultsDriftSources != null &&
    !hasDriftSources &&
    appliedSources.length === 0;

  return (
    <>
      {renderNotFound && (
        <NotificationCard title="No sources with config drift found in your environment." />
      )}
      {(hasDriftSources || appliedSources.length > 0) && (
        <div className="flex flex-col gap-4">
          <NotificationCard
            title={formatNotificationCardTitleAndDescription(currentStep).title}
            description={
              formatNotificationCardTitleAndDescription(currentStep).description
            }
          />
          <Steps
            size="small"
            current={steps.findIndex((step) => step.key === currentStep)}
            onChange={handleStepChange}
            items={steps.map((step) =>
              step.key === 'build-deploy'
                ? { ...step, disabled: !buildDeployUnlocked }
                : step,
            )}
          />

          {liveResults.length > 0 && <LiveApplyResult live={liveResults} />}
          {currentStep === 'config-drift' && (
            <ConfigDriftTab
              onSuccess={handleConfigDriftSuccess}
              defaultsDriftSources={defaultsDriftSources ?? []}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
          {currentStep === 'build-deploy' && (
            <BuildDeployTab
              appliedSources={appliedSources}
              onSuccess={onSuccess}
              appliedSuccessMessage={appliedSuccessMessage}
            />
          )}
        </div>
      )}
    </>
  );
};
