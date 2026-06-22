import { useBuildSource } from '@/Sources/hooks/useBuildSource';
import { Tabs } from 'antd';
import { useEffect } from 'react';
import { BuildSourceBanner } from './BuildSourceBanner';
import { GeneratedDdlTabContent } from './GeneratedDdlTabContent';
import { GeneratedViewsTabContent } from './GeneratedViewsTabContent';

export const SourceDdlPreviewTabContent = ({
  source_name,
  source_version,
}: {
  source_name: string;
  source_version: string;
}) => {
  const { data, mutate, isPending, error, reset } = useBuildSource();

  useEffect(() => {
    reset();
  }, [source_name, source_version, reset]);

  const buildResult = data?.version === source_version ? data : undefined;

  return (
    <div className="h-[calc(100vh-225px)] css-custom-scrollbar pr-4 flex flex-col gap-4">
      <BuildSourceBanner
        onClick={() => mutate({ source_name, source_version })}
        isPending={isPending}
        error={error}
      />

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
