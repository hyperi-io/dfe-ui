import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { DeleteUserDrawer } from '@/Settings/components/UserManagement/DeleteUserDrawer';
import { DeReactivateUser } from '@/Settings/components/UserManagement/DeReactivateUser';
import { EditUserDrawer } from '@/Settings/components/UserManagement/EditUserDrawer';
import { ViewUserDrawer } from '@/Settings/components/UserManagement/ViewUserDrawer';

export const RowActions = ({
  username,
  isActive,
  refetch,
}: {
  username: string;
  isActive: boolean;
  refetch: () => void;
}) => {
  return (
    <PopoverMenu
      options={[
        <ViewUserDrawer key="view-user" username={username} />,
        <EditUserDrawer
          key="edit-user"
          username={username}
          refetch={refetch}
        />,
        <DeReactivateUser
          key="dereactivate-user"
          username={username}
          isActive={isActive}
          refetch={refetch}
        />,
        <DeleteUserDrawer
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
