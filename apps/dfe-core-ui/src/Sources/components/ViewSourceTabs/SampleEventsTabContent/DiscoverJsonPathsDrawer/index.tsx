import { Drawer } from '@/core/components/Drawer';
import { PromoteJsonPaths } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/PromoteJsonPaths';
import { JsonPaths } from '@/Sources/hooks/useFetchJsonPaths/types';
import { PromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { App, Button, Tabs } from 'antd';
import { useState } from 'react';
import { DiscoverJsonPathsDetails } from './DiscoverJsonPathsDetails';

type ActiveTab = 'discover' | 'review';
export const DiscoverJsonPathsDrawer = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: Set<string>;
}) => {
  const { notification } = App.useApp();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [canPromote, setCanPromote] = useState(false);
  const [promoteTestResponse, setPromoteTestResponse] =
    useState<PromoteFieldResponse | null>(null);
  const [jsonPaths, setJsonPaths] = useState<JsonPaths | null>(null);

  return (
    <>
      <Button type="primary" onClick={() => setIsDrawerVisible(true)}>
        Promote Fields
      </Button>
      <Drawer
        title="Promote Fields"
        open={isDrawerVisible}
        size="80%"
        onClose={() => setIsDrawerVisible(false)}
        destroyOnHidden
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'discover' | 'review')}
          items={[
            {
              key: 'discover',
              label: 'Discover',
              children: (
                <DiscoverJsonPathsDetails
                  selectedSourceName={selectedSourceName}
                  selectedSourceVersion={selectedSourceVersion}
                  fieldsToPromote={Array.from(fieldsToPromote)}
                  onSuccess={(response) => {
                    setCanPromote(true);
                    setActiveTab('review');
                    setPromoteTestResponse(response);
                  }}
                  onDataLoad={(response) => {
                    setJsonPaths(response);
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
                  selectedSourceName={selectedSourceName}
                  data={promoteTestResponse}
                  jsonPaths={jsonPaths}
                  onSuccess={() => {
                    setIsDrawerVisible(false);
                    notification.success({
                      title: 'Fields promoted successfully',
                      placement: 'bottomLeft',
                    });
                  }}
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};
