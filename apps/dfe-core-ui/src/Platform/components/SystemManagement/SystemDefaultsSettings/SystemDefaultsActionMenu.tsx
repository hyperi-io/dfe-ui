import { PopoverMenu } from '@/core/components/PopoverMenu';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  IdentifyConfigDriftDrawer,
  IdentifyConfigDriftMenuButton,
} from '@/Platform/components/SystemManagement/IdentifyConfigDriftDrawer';
import { IconPencil } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const SystemDefaultsActionMenu = ({
  onClick,
  isConfigDriftOpen = false,
  onConfigDriftClose,
}: {
  onClick: {
    onEditDefaultsClick: () => void;
  };
  isConfigDriftOpen: boolean;
  onConfigDriftClose?: () => void;
}) => {
  const [openedFromMenu, setOpenedFromMenu] = useState(false);

  const closeConfigDrift = () => {
    setOpenedFromMenu(false);
    onConfigDriftClose?.();
  };

  return (
    <>
      <PopoverMenu
        ariaLabel={`System defaults actions`}
        placement="leftTop"
        options={[
          <RbacProtected
            key="edit-defaults"
            action={RbacProtected.rbacActions.system_write}
          >
            <RbacProtected.Unrestricted>
              <Button
                key="edit-defaults"
                size="small"
                onClick={onClick.onEditDefaultsClick}
                type="text"
                icon={<IconPencil />}
              >
                Edit Defaults
              </Button>
            </RbacProtected.Unrestricted>
            <RbacProtected.Restricted tooltip={{ show: true }}>
              <Button
                key="edit-defaults"
                size="small"
                disabled
                type="text"
                icon={<IconPencil />}
              >
                Edit Defaults
              </Button>
            </RbacProtected.Restricted>
          </RbacProtected>,
          <IdentifyConfigDriftMenuButton
            key="identify-config-drift"
            onClick={() => setOpenedFromMenu(true)}
          />,
        ]}
      />
      <IdentifyConfigDriftDrawer
        open={isConfigDriftOpen || openedFromMenu}
        onClose={closeConfigDrift}
      />
    </>
  );
};
