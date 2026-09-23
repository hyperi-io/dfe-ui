import { PopoverMenu } from '@/core/components/PopoverMenu';
import { DeleteAccountDrawer } from '@/Settings/components/AccountManagement/DeleteAccountDrawer';
import { DeReactivateAccount } from '@/Settings/components/AccountManagement/DeReactivateAccount';
import { EditAccountDrawer } from '@/Settings/components/AccountManagement/EditAccountDrawer';
import { ViewAccountDrawer } from '@/Settings/components/AccountManagement/ViewAccountDrawer';

export const RowActions = ({
  username,
  isActive,
  isExternal,
  refetch,
}: {
  username: string;
  isActive: boolean;
  isExternal: boolean;
  refetch: () => void;
}) => {
  return (
    <PopoverMenu
      options={[
        <ViewAccountDrawer key="view-user" username={username} />,
        <EditAccountDrawer
          key="edit-user"
          username={username}
          refetch={refetch}
          isExternal={isExternal}
        />,
        <DeReactivateAccount
          key="dereactivate-user"
          username={username}
          isActive={isActive}
          refetch={refetch}
        />,
        <DeleteAccountDrawer
          key="delete-user"
          username={username}
          isActive={isActive}
          refetch={refetch}
        />,
      ]}
      ariaLabel="User actions"
    />
  );
};
