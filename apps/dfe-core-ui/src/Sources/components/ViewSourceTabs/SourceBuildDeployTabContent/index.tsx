import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { DeploySourceDrawer } from '@/Sources/components/DeploySourceDrawer';
import { ViewDeployedSourceDrawer } from '@/Sources/components/ViewDeployedSourceDrawer';
import { useBuildSource } from '@/Sources/hooks/useBuildSource';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { IconPlayerPlay } from '@repo/dfe-icons';
import { Button, Tabs } from 'antd';
import { useEffect } from 'react';
import { GeneratedDdlTabContent } from './GeneratedDdlTabContent';
import { GeneratedViewsTabContent } from './GeneratedViewsTabContent';

export const SourceBuildDeployTabContent = ({
  source_name,
  source_version,
  build_result: buildResult,
  deploy_result: deployResult,
  onSuccess,
  className,
}: {
  source_name: string;
  source_version: string;
  build_result: TSourceVersionDetail['version']['source_build'];
  deploy_result: TSourceVersionDetail['version']['source_deployment'];
  onSuccess?: {
    onDeploySuccess?: () => void;
  };
  className?: string;
}) => {
  const {
    mutate: buildSourceMutation,
    isPending: isPendingBuildSource,
    error: errorBuildSource,
    reset: resetBuildSource,
  } = useBuildSource();

  useEffect(() => {
    resetBuildSource();
  }, [source_name, source_version, resetBuildSource]);

  return (
    <div className={cn('pr-4 flex flex-col gap-4', className)}>
      {!buildResult && (
        <NotificationCard
          title="Build Source"
          type="action"
          description={
            <div className="flex flex-col gap-1">
              <p>Build source to see DDL preview</p>

              {errorBuildSource && (
                <FormNotification
                  text={errorBuildSource.message}
                  type="error"
                />
              )}
            </div>
          }
          action={
            <Button
              type="primary"
              loading={isPendingBuildSource}
              onClick={() =>
                buildSourceMutation({ source_name, source_version })
              }
            >
              Build <IconPlayerPlay />
            </Button>
          }
        />
      )}

      {buildResult && (
        <NotificationCard
          title={deployResult ? 'View Deployed Source' : 'Deploy Source'}
          type="action"
          description={
            <p>
              {deployResult ? (
                'View generated DDL and views of deployed source'
              ) : (
                <span>
                  Deploy{' '}
                  <span className="font-semibold">
                    {source_name}@{source_version}
                  </span>{' '}
                  to Clickhouse table
                </span>
              )}
            </p>
          }
          action={
            <>
              <DeploySourceDrawer
                classNames={{
                  button: deployResult ? 'hidden' : undefined,
                }}
                source_name={source_name}
                version={source_version}
                onSuccess={onSuccess}
              />
              {deployResult && (
                <ViewDeployedSourceDrawer
                  source_name={source_name}
                  version={source_version}
                  deploy_result={deployResult}
                />
              )}
            </>
          }
        />
      )}

      {buildResult && (
        <Tabs
          classNames={{
            item: 'm-0 p-0 pb-2 mr-4',
            indicator: 'bg-tertiary/40',
          }}
          items={[
            {
              key: 'generated-ddl',
              label: 'Generated DDL',
              children: (
                <GeneratedDdlTabContent
                  source_name={source_name}
                  source_version={source_version}
                  create_table={buildResult.ddl?.create_table}
                />
              ),
            },
            {
              key: 'generated-views',
              label: 'Generated Views',
              children: (
                <GeneratedViewsTabContent
                  source_name={source_name}
                  source_version={source_version}
                  views={buildResult.ddl?.views}
                />
              ),
            },
          ]}
        />
      )}
    </div>
  );
};
