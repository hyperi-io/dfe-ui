import { useListSourcesContext } from '@/Sources/contexts/ListSourcesContext';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { App, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { DiscoverJsonPathsDetails } from './DiscoverJsonPathsDetails';
import { PromoteJsonPaths } from './PromoteJsonPathsDetails';

type ActiveTab = 'discover' | 'review';

export const NonMainSourcePromoteWizard = ({
  onSuccess,
}: {
  onSuccess?: (response?: TPromoteFieldResponse) => void;
}) => {
  const { selectedSourceName, selectedSourceVersion } = useListSourcesContext();
  const [attachedSchemaPath, setAttachedSchemaPath] = useState<string | null>(
    null,
  );
  const { notification } = App.useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [canPromote, setCanPromote] = useState(false);
  const [promoteTestResponse, setPromoteTestResponse] =
    useState<TPromoteFieldResponse | null>(null);
  const [jsonPaths, setJsonPaths] = useState<TJsonPathsResponse | null>(null);

  const handleSuccess = useCallback(() => {
    setActiveTab('discover');
    setCanPromote(false);
    setPromoteTestResponse(null);
    setJsonPaths(null);
    notification.success({
      title: 'Fields promoted successfully',
      placement: 'bottomLeft',
    });

    onSuccess?.();
  }, [onSuccess, notification]);

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => setActiveTab(key as 'discover' | 'review')}
      items={[
        {
          key: 'discover',
          label: 'Discover',
          children: (
            <DiscoverJsonPathsDetails
              selectedSourceName={String(selectedSourceName)}
              selectedSourceVersion={String(selectedSourceVersion)}
              onSuccess={(response) => {
                setCanPromote(true);
                setActiveTab('review');
                setPromoteTestResponse(response);
              }}
              onDataLoad={(response) => {
                setJsonPaths(response);
              }}
              setAttachedSchemaPath={(schemaPath) => {
                setAttachedSchemaPath(schemaPath);
              }}
            />
          ),
        },
        {
          key: 'review',
          label: 'Review',
          disabled: !canPromote,
          children: (
            <PromoteJsonPaths
              selectedSourceName={String(selectedSourceName)}
              selectedSourceVersion={String(selectedSourceVersion)}
              data={promoteTestResponse}
              jsonPaths={jsonPaths}
              onSuccess={handleSuccess}
              attachedSchemaPath={attachedSchemaPath}
            />
          ),
        },
      ]}
    />
  );
};
