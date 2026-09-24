import { PopoverMenu } from '@/core/components/PopoverMenu';
import { DeleteAccountDrawer } from '@/Settings/components/AccountManagement/DeleteAccountDrawer';
import { DeReactivateAccount } from '@/Settings/components/AccountManagement/DeReactivateAccount';
import { EditAccountDrawer } from '@/Settings/components/AccountManagement/EditAccountDrawer';
import { ViewAccountDrawer } from '@/Settings/components/AccountManagement/ViewAccountDrawer';

export const RowActions = ({
  username,
  isActive,
  isExternal,
}: {
  username: string;
  isActive: boolean;
  isExternal: boolean;
}) => {
  return (
    <PopoverMenu
      options={[
        <ViewAccountDrawer key="view-user" username={username} />,
        <EditAccountDrawer
          key="edit-user"
          username={username}
          isExternal={isExternal}
        />,
        <DeReactivateAccount
          key="dereactivate-user"
          username={username}
          isActive={isActive}
        />,
        <DeleteAccountDrawer
          key="delete-user"
          username={username}
          isActive={isActive}
          isExternal={isExternal}
        />,
      ]}
      ariaLabel="User actions"
    />
  );
};
