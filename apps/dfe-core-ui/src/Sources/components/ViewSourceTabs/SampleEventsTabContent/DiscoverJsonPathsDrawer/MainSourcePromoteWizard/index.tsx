import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { Steps, StepsProps } from 'antd';
import { useState } from 'react';
import { BuildSourceStep } from './BuildSourceStep';
import { CreateSchemaStep } from './CreateSchemaStep';
import { CreateSourceStep } from './CreateSourceStep';
import { DeploySourceStep } from './DeploySourceStep';
import { DiscoverPathsStep } from './DiscoverPathsStep';

// interface StepItem {
//   // key?: React.Key;
//   // className?: string;
//   // style?: React.CSSProperties;
//   // classNames?: GetProp<RcStepsProps, 'items'>[number]['classNames'];
//   // styles?: GetProp<RcStepsProps, 'items'>[number]['styles'];
//   /** @deprecated Please use `content` instead */
//   description?: React.ReactNode;
//   content?: React.ReactNode;
//   icon?: React.ReactNode;
//   onClick?: React.MouseEventHandler<HTMLElement>;
//   status?: 'wait' | 'process' | 'finish' | 'error';
//   disabled?: boolean;
//   title?: React.ReactNode;
//   subTitle?: React.ReactNode;
// }

const steps: StepsProps['items'] = [
  {
    key: 'discover-paths',
    title: 'Discover',
  },
  {
    key: 'create-schema',
    title: 'Create Schema',
  },
  {
    key: 'create-source',
    title: 'Create Source',
    subTitle: '(Optional)',
  },
  {
    key: 'build-source',
    title: 'Build Source (Optional)',
  },
  {
    key: 'deploy-source',
    title: 'Deploy Source (Optional)',
  },
];

export const MainSourcePromoteWizard = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
  onSuccess,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: Set<string>;
  onSuccess?: (response?: TPromoteFieldResponse) => void;
}) => {
  const [current, setCurrent] = useState({ key: 'discover-paths', index: 0 });

  const handleStepChange = (value: number) => {
    setCurrent({ key: String(steps[value].key), index: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <Steps
        current={current.index}
        onChange={handleStepChange}
        items={steps}
        size="small"
      />
      {current.key === 'discover-paths' && <DiscoverPathsStep />}
      {current.key === 'create-schema' && <CreateSchemaStep />}
      {current.key === 'create-source' && <CreateSourceStep />}
      {current.key === 'build-source' && <BuildSourceStep />}
      {current.key === 'deploy-source' && <DeploySourceStep />}
    </div>
  );
};
