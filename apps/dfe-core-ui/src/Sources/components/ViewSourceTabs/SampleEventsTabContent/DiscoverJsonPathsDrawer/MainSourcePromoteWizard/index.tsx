import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { IconExternalLink } from '@repo/dfe-icons';
import { Button, Steps, StepsProps } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { BuildDeploySourceStep } from './BuildDeploySourceStep';
import { CreateSourceStep } from './CreateSourceStep';
import { DiscoverPromoteStep } from './DiscoverPromoteStep';

type StepKey =
  | 'discover-promote'
  | 'create-assign-source'
  | 'build-deploy-source';

const STEP_INDEX_MAP: Record<
  'discoverPromote' | 'createAssign' | 'buildDeploy',
  { index: number; key: StepKey }
> = {
  discoverPromote: { index: 0, key: 'discover-promote' },
  createAssign: { index: 1, key: 'create-assign-source' },
  buildDeploy: { index: 2, key: 'build-deploy-source' },
};

const getStepStatus = ({
  stepKey,
  createdSchema,
  createdSource,
}: {
  stepKey: string;
  createdSchema: string | null | undefined;
  createdSource: string | null | undefined;
}): NonNullable<StepsProps['items']>[number]['status'] => {
  if (stepKey === STEP_INDEX_MAP.discoverPromote.key && createdSchema) {
    return 'finish';
  }

  if (stepKey === STEP_INDEX_MAP.createAssign.key && createdSource) {
    return 'finish';
  }
  return 'wait';
};

export const MainSourcePromoteWizard = ({
  onSuccess: onFinalSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const { selectedSourceName, selectedSourceVersion } = useListSourcesContext();
  const { fieldsToPromote: fieldsToPromoteSet } = usePromoteRowsContext();
  const fieldsToPromote = Array.from(fieldsToPromoteSet);
  const [current, setCurrent] = useState<{ key: StepKey; index: number }>(
    STEP_INDEX_MAP.discoverPromote,
  );
  const [createdSchema, setCreatedSchema] = useState<string | null | undefined>(
    null,
  );
  const [createdSource, setCreatedSource] = useState<string | null | undefined>(
    null,
  );

  const steps = [
    {
      key: STEP_INDEX_MAP.discoverPromote.key,
      title: 'Discover & Promote',
      status: getStepStatus({
        stepKey: 'discover-paths',
        createdSchema,
        createdSource,
      }),
    },
    {
      key: STEP_INDEX_MAP.createAssign.key,
      title: 'Create & Assign to Source',
      subTitle: '(Optional)',
      disabled: !createdSchema,
      status: getStepStatus({
        stepKey: 'create-source',
        createdSchema,
        createdSource,
      }),
    },
    {
      key: STEP_INDEX_MAP.buildDeploy.key,
      title: 'Build & Deploy Source (Optional)',
      disabled: !createdSchema && !createdSource,
      status: getStepStatus({
        stepKey: 'build-source',
        createdSchema,
        createdSource,
      }),
    },
  ];

  const handleStepChange = (value: number) => {
    const stepKey =
      Object.values(STEP_INDEX_MAP).find((step) => step.index === value) ??
      STEP_INDEX_MAP.discoverPromote;

    setCurrent(stepKey);
  };

  const {
    data: jsonPaths,
    isLoading: isLoadingJsonPaths,
    error: errorJsonPaths,
  } = useFetchJsonPaths({
    source_name: String(selectedSourceName),
    version: String(selectedSourceVersion),
    paths: fieldsToPromote.join(','),
  });

  const handleFinalSuccess = () => {
    onFinalSuccess?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <Steps
        className="mb-2"
        current={current.index}
        onChange={handleStepChange}
        items={steps}
        size="small"
      />
      {createdSchema && (
        <NotificationCard
          title={
            <div className="flex flex-col gap-2">
              {createdSchema && (
                <span className="flex items-center gap-2">
                  Schema Created:
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/schemas/meta-schemas?${new URLSearchParams({
                      schema_path: createdSchema,
                      schema_version: '1.0.0',
                    }).toString()}`}
                    className={cn(
                      // Layout
                      'flex items-center gap-2',
                      // Style
                      'text-foreground-muted dark:text-foreground-muted hover:underline',
                    )}
                  >
                    <IconExternalLink />
                    {createdSchema}
                  </Link>
                </span>
              )}
              {createdSource && (
                <span className="flex items-center gap-2">
                  Source Created:
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`/sources?${new URLSearchParams({
                      source_name: createdSource,
                      source_version: '1.0.0',
                    }).toString()}`}
                    className={cn(
                      // Layout
                      'flex items-center gap-2',
                      // Style
                      'text-foreground-muted dark:text-foreground-muted hover:underline',
                    )}
                  >
                    <IconExternalLink />
                    {createdSource}
                  </Link>
                </span>
              )}
            </div>
          }
          type="success"
          action={
            <Button
              type="primary"
              className="bg-green-500 text-white hover:bg-green-600"
              htmlType="button"
              onClick={() => {
                onFinalSuccess?.();
              }}
            >
              Close Wizard
            </Button>
          }
        />
      )}

      {current.key === STEP_INDEX_MAP.discoverPromote.key && !createdSchema && (
        <DiscoverPromoteStep
          jsonPaths={{
            data: jsonPaths,
            isLoading: isLoadingJsonPaths,
            error: errorJsonPaths,
          }}
          onSuccess={(schema) => {
            setCreatedSchema(schema.path);
            setCurrent(STEP_INDEX_MAP.createAssign);
          }}
          isCreatedSchema={!!createdSchema}
        />
      )}
      {current.key === STEP_INDEX_MAP.createAssign.key && !createdSource && (
        <CreateSourceStep
          schemaPath={createdSchema ?? ''}
          onSuccess={(source) => {
            setCreatedSource(source.source);
            setCurrent(STEP_INDEX_MAP.buildDeploy);
          }}
        />
      )}
      {current.key === STEP_INDEX_MAP.buildDeploy.key && (
        <BuildDeploySourceStep
          onSuccess={handleFinalSuccess}
          createdSource={createdSource ?? ''}
        />
      )}
    </div>
  );
};
