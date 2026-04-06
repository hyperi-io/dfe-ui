import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { DeleteUserDrawer } from '@/Settings/components/UserManagement/DeleteUserDrawer';
import { DeReactivateUser } from '@/Settings/components/UserManagement/DeReactivateUser';
import { EditUserDrawer } from '@/Settings/components/UserManagement/EditUserDrawer';
import { ViewUserDrawer } from '@/Settings/components/UserManagement/ViewUserDrawer';

export const RowActions = ({
  name,
  isActive,
}: {
  name: string | undefined;
  isActive: boolean;
}) => {
  return (
    <PopoverMenu
      options={[
        <ViewUserDrawer key="view-user" title={`View ${name}`} />,
        <EditUserDrawer key="edit-user" title={`Edit ${name}`} />,
        <DeReactivateUser key="dereactivate-user" isActive={isActive} />,
        <DeleteUserDrawer
          key="delete-user"
          title={`Delete ${name}`}
          isActive={isActive}
        />,
      ]}
      ariaLabel="User actions"
    />
  );
};
