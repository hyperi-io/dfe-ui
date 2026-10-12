import { NotificationCard } from '@/core/components/NotificationCard';
import { TBulkActionSourcesRequestBody } from '@/core/hooks/useBulkActionSources/types';
import { TApplyDefaultsResponse } from '@/Platform/hooks/system/useApplyDefaults/types';
import { useFetchInfiniteDefaultsDriftSources } from '@/Platform/hooks/system/useFetchInifniteDefaultDriftSources';
import { Spin, Steps, StepsProps } from 'antd';
import { useState } from 'react';
import { BuildDeployTab } from './BuildDeployTab';
import { ConfigDriftTab } from './ConfigDriftTab';

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
          'Configuration drift has been identified for sources in your environment. Applying defaults only updates the configuration files and will not cause any database changes. You will need to deploy these changes separately.',
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
}: {
  onSuccess?: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState<CurrentStep>('config-drift');
  const [appliedSources, setAppliedSources] = useState<
    TBulkActionSourcesRequestBody['sources']
  >([]);

  const [appliedSuccessMessage, setAppliedSuccessMessage] =
    useState<string>('');

  const handleConfigDriftSuccess = (sources: TApplyDefaultsResponse) => {
    const message = appliedDefaultsMessage(sources.updated, sources.unchanged);
    setAppliedSuccessMessage(message);
    setAppliedSources([...appliedSources, ...sources.updated]);
    setCurrentStep('build-deploy');
  };

  const {
    data: { items: defaultsDriftSources } = {},
    isLoading,
    error,
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

  return (
    <>
      {defaultsDriftSources && defaultsDriftSources.length === 0 && (
        <NotificationCard title="No sources with config drift found in your environment." />
      )}
      {defaultsDriftSources && defaultsDriftSources.length > 0 && (
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
            onChange={(step) => setCurrentStep(steps[step].key as CurrentStep)}
            items={steps}
          />

          {currentStep === 'config-drift' && (
            <ConfigDriftTab
              onSuccess={handleConfigDriftSuccess}
              defaultsDriftSources={defaultsDriftSources ?? []}
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
