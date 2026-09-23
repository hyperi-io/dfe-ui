import { Drawer } from '@/core/components/Drawer';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useSourceDetailsContext } from '@/Sources/contexts/SourceDetailsContext';
import { Button } from 'antd';
import { useCallback, useState } from 'react';
import { MainSourcePromoteWizard } from './MainSourcePromoteWizard';
import { NonMainSourcePromoteWizard } from './NonMainSourcePromoteWizard';

const UNCOMMITTED_CLOSE_MESSAGE =
  'Field promotions have not been committed. Leave anyway and discard your review?';
export const DiscoverJsonPathsDrawer = () => {
  const { isMainSource } = useSourceDetailsContext();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const [isUncommittedChanges, setIsUncommittedChanges] = useState(false);

  const hasUncommittedChanges = isDrawerVisible && isUncommittedChanges;

  const closeDrawer = useCallback(() => {
    setIsDrawerVisible(false);
    setIsUncommittedChanges(false);
  }, []);

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
        onClose={closeDrawer}
        destroyOnHidden
        preventClickaway={{
          enabled: hasUncommittedChanges,
          message: UNCOMMITTED_CLOSE_MESSAGE,
          title: 'Uncommitted changes',
        }}
      >
        {isMainSource ? (
          <MainSourcePromoteWizard
            onChange={setIsUncommittedChanges}
            onSuccess={closeDrawer}
          />
        ) : (
          <NonMainSourcePromoteWizard
            onChange={setIsUncommittedChanges}
            onSuccess={closeDrawer}
          />
        )}
      </Drawer>
    </>
  );
};
