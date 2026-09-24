import { PopoverMenu } from '@/core/components/PopoverMenu';
import { BlockUnblockAccount } from '@/Settings/components/AccountManagement/BlockUnblockAccount';
import { DeleteAccountDrawer } from '@/Settings/components/AccountManagement/DeleteAccountDrawer';
import { DeReactivateAccount } from '@/Settings/components/AccountManagement/DeReactivateAccount';
import { EditAccountDrawer } from '@/Settings/components/AccountManagement/EditAccountDrawer';
import { ViewAccountDrawer } from '@/Settings/components/AccountManagement/ViewAccountDrawer';

export const RowActions = ({
  username,
  isActive,
  isExternal,
  isBlocked,
}: {
  username: string;
  isActive: boolean;
  isExternal: boolean;
  isBlocked: boolean;
}) => {
  return (
    <PopoverMenu
      options={[
        <ViewAccountDrawer key="view-user" username={username} />,
        ...(!isBlocked
          ? [
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
            ]
          : []),
        <BlockUnblockAccount
          key="block-user"
          username={username}
          isBlocked={isBlocked}
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
