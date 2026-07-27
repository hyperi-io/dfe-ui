import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { usePreventNavigate } from '@/core/hooks/usePreventNavigate';
import { PromoteJsonPaths } from '@/Sources/components/ViewSourceTabs/SampleEventsTabContent/PromoteJsonPaths';
import { TJsonPathsResponse } from '@/Sources/hooks/useFetchJsonPaths/types';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { IconAlertCircle } from '@repo/dfe-icons';
import { App, Button, Tabs } from 'antd';
import { useCallback, useState } from 'react';
import { DiscoverJsonPathsDetails } from './DiscoverJsonPathsDetails';

type ActiveTab = 'discover' | 'review';

const UNCOMMITTED_CLOSE_MESSAGE =
  'Field promotions have not been committed. Leave anyway and discard your review?';
export const DiscoverJsonPathsDrawer = ({
  selectedSourceName,
  selectedSourceVersion,
  fieldsToPromote,
}: {
  selectedSourceName: string;
  selectedSourceVersion: string;
  fieldsToPromote: Set<string>;
}) => {
  const [attachedSchemaPath, setAttachedSchemaPath] = useState<string | null>(
    null,
  );
  const { notification } = App.useApp();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [canPromote, setCanPromote] = useState(false);
  const [promoteTestResponse, setPromoteTestResponse] =
    useState<TPromoteFieldResponse | null>(null);
  const [jsonPaths, setJsonPaths] = useState<TJsonPathsResponse | null>(null);

  const hasUncommittedChanges = isDrawerVisible && promoteTestResponse != null;

  const { confirmLeave } = usePreventNavigate({
    enabled: hasUncommittedChanges,
    modal: {
      title: (
        <span className="flex items-center gap-x-2">
          <IconAlertCircle /> Uncommitted changes
        </span>
      ),
      message: UNCOMMITTED_CLOSE_MESSAGE,
    },
  });

  const closeDrawer = useCallback(() => {
    setIsDrawerVisible(false);
    setActiveTab('discover');
    setCanPromote(false);
    setPromoteTestResponse(null);
    setJsonPaths(null);
  }, []);

  const requestCloseDrawer = useCallback(() => {
    confirmLeave(closeDrawer);
  }, [closeDrawer, confirmLeave]);

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.schema_write}>
        <RbacProtected.Unrestricted>
          <Button type="primary" onClick={() => setIsDrawerVisible(true)}>
            Promote Fields
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true, placement: 'bottom' }}>
          <Button type="primary" disabled>
            Promote Fields
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>

      <Drawer
        title="Promote Fields"
        open={isDrawerVisible}
        size="80%"
        onClose={requestCloseDrawer}
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
                  selectedSourceName={selectedSourceName}
                  selectedSourceVersion={selectedSourceVersion}
                  data={promoteTestResponse}
                  jsonPaths={jsonPaths}
                  onSuccess={() => {
                    closeDrawer();
                    notification.success({
                      title: 'Fields promoted successfully',
                      placement: 'bottomLeft',
                    });
                  }}
                  attachedSchemaPath={attachedSchemaPath}
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};
