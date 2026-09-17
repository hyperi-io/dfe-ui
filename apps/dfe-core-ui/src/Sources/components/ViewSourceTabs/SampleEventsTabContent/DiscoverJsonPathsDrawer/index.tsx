import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { usePreventNavigate } from '@/core/hooks/usePreventNavigate';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { TPromoteFieldResponse } from '@/Sources/hooks/usePromoteFields/types';
import { IconAlertCircle } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useCallback, useState } from 'react';
import { MainSourcePromoteWizard } from './MainSourcePromoteWizard';
import { NonMainSourcePromoteWizard } from './NonMainSourcePromoteWizard';

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
  const { isMainSource } = useSourceDetailsContext();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [promoteTestResponse, setPromoteTestResponse] =
    useState<TPromoteFieldResponse | null>(null);

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

    setPromoteTestResponse(null);
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
        {isMainSource ? (
          <MainSourcePromoteWizard
            selectedSourceName={selectedSourceName}
            selectedSourceVersion={selectedSourceVersion}
            fieldsToPromote={fieldsToPromote}
            onSuccess={closeDrawer}
          />
        ) : (
          <NonMainSourcePromoteWizard
            selectedSourceName={selectedSourceName}
            selectedSourceVersion={selectedSourceVersion}
            fieldsToPromote={fieldsToPromote}
            onSuccess={closeDrawer}
          />
        )}
      </Drawer>
    </>
  );
};
