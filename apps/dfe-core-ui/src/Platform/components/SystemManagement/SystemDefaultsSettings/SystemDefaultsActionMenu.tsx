import { PopoverMenu } from '@/core/components/PopoverMenu';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IdentifyConfigDriftDrawer } from '@/Platform/components/SystemManagement/IdentifyConfigDriftDrawer';
import { IconPencil } from '@repo/dfe-icons';
import { Button } from 'antd';

export const SystemDefaultsActionMenu = ({
  onClick,
  isConfigDriftOpen = false,
}: {
  onClick: {
    onEditDefaultsClick: () => void;
  };
  isConfigDriftOpen: boolean;
}) => {
  return (
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
        <IdentifyConfigDriftDrawer
          open={isConfigDriftOpen}
          key="identify-config-drift"
        />,
      ]}
    />
  );
};
