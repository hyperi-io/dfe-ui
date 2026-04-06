import { PopoverMenu } from '../../PopoverMenu';
import { DeleteUserDrawer } from '../DeleteUserDrawer';
import { DeReactivateUser } from '../DeReactivateUser';
import { EditUserDrawer } from '../EditUserDrawer';
import { ViewUserDrawer } from '../ViewUserDrawer';

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
        <ViewUserDrawer title={`View ${name}`} />,
        <EditUserDrawer title={`Edit ${name}`} />,
        <DeReactivateUser isActive={isActive} />,
        <DeleteUserDrawer
          title={`Delete ${name}`}
          isActive={isActive}
          name={name ?? 'User'}
        />,
      ]}
      ariaLabel="User actions"
    />
  );
};
