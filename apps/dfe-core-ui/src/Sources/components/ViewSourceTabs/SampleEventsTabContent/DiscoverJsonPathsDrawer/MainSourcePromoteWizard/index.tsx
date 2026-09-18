import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { usePromoteRowsContext } from '@/Sources/components/ViewSourceTabs/contexts/PromoteRows.context';
import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { useFetchJsonPaths } from '@/Sources/hooks/useFetchJsonPaths';
import { IconExternalLink } from '@repo/dfe-icons';
import { Steps, StepsProps } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { BuildSourceStep } from './BuildSourceStep';
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
}: {
  stepKey: string;
  createdSchema: string | null | undefined;
}): NonNullable<StepsProps['items']>[number]['status'] => {
  if (stepKey === STEP_INDEX_MAP.discoverPromote.key && createdSchema) {
    return 'finish';
  }

  return 'wait';
};

export const MainSourcePromoteWizard = ({
  onSuccess: onFinalSuccess,
}: {
  onSuccess: () => void;
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

  const steps = [
    {
      key: STEP_INDEX_MAP.discoverPromote.key,
      title: 'Discover & Promote',
      status: getStepStatus({ stepKey: 'discover-paths', createdSchema }),
    },
    {
      key: STEP_INDEX_MAP.createAssign.key,
      title: 'Create & Assign to Source',
      subTitle: '(Optional)',
      disabled: !createdSchema,
      status: getStepStatus({ stepKey: 'create-source', createdSchema }),
    },
    {
      key: STEP_INDEX_MAP.buildDeploy.key,
      title: 'Build & Deploy Source (Optional)',
      disabled: !createdSchema,
      status: getStepStatus({ stepKey: 'build-source', createdSchema }),
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

  return (
    <div className="flex flex-col gap-4">
      <Steps
        className="mb-2"
        current={current.index}
        onChange={handleStepChange}
        items={steps}
        size="small"
      />

      {current.key === STEP_INDEX_MAP.discoverPromote.key && (
        <>
          {!createdSchema && (
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

          {createdSchema && (
            <NotificationCard
              title={
                <span className="flex items-center gap-2">
                  View Schema:
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
              }
              description="Schema created successfully"
              type="success"
            />
          )}
        </>
      )}
      {current.key === STEP_INDEX_MAP.createAssign.key && (
        <CreateSourceStep schemaPath={createdSchema ?? ''} />
      )}
      {current.key === STEP_INDEX_MAP.buildDeploy.key && (
        <BuildSourceStep onSuccess={onFinalSuccess} />
      )}
    </div>
  );
};
