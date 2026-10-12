import { TBulkActionSourcesRequestBody } from '@/core/hooks/useBulkActionSources/types';
import { TApplyDefaultsResponse } from '@/Platform/hooks/system/useApplyDefaults/types';
import { Steps, StepsProps } from 'antd';
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
    setAppliedSources(sources.updated);
    setCurrentStep('build-deploy');
  };

  return (
    <div className="flex flex-col gap-4">
      <Steps
        size="small"
        current={steps.findIndex((step) => step.key === currentStep)}
        onChange={(step) => setCurrentStep(steps[step].key as CurrentStep)}
        items={steps}
      />

      {currentStep === 'config-drift' && (
        <ConfigDriftTab onSuccess={handleConfigDriftSuccess} />
      )}
      {currentStep === 'build-deploy' && (
        <BuildDeployTab
          appliedSources={appliedSources}
          onSuccess={onSuccess}
          appliedSuccessMessage={appliedSuccessMessage}
        />
      )}
    </div>
  );
};
