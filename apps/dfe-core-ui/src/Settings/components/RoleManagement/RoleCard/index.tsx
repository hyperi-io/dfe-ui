import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { CloneRoleModal } from '@/Settings/components/RoleManagement/CloneRoleModal';
import { DeleteRoleModal } from '@/Settings/components/RoleManagement/DeleteRoleModal';
import { EditRoleDrawer } from '@/Settings/components/RoleManagement/EditRoleDrawer';
import { ViewRoleDetailsDrawer } from '@/Settings/components/RoleManagement/ViewRoleDetailsDrawer';
import { TRoleListItem } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoles/types';
import { IconLockFilled } from '@repo/dfe-icons';

const PERMISSION_LIMIT = 4;

export const RoleCard = ({
  role,
  refetch,
}: {
  role: TRoleListItem;
  refetch: () => void;
}) => {
  const isCoreRole = role.resource_type === RESOURCE_TYPES.CORE;
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative h-full">
      <div className="flex flex-col gap-1">
        <PopoverMenu
          className="absolute top-1 right-1"
          ariaLabel="Role actions"
          options={[
            <ViewRoleDetailsDrawer
              role_name={role.name}
              key="view-role-details"
            />,
            ...(!isCoreRole
              ? [
                  <EditRoleDrawer
                    key="edit-role"
                    disabled={isCoreRole}
                    role_name={role.name}
                    refetch={refetch}
                  />,
                ]
              : []),
            <CloneRoleModal
              key="clone-role"
              role_name={role.name}
              refetch={refetch}
            />,
            ...(!isCoreRole
              ? [
                  <DeleteRoleModal
                    key="delete-role"
                    disabled={isCoreRole}
                    role_name={role.name}
                    refetch={refetch}
                  />,
                ]
              : []),
          ]}
        />

        <h3 className="font-medium flex items-center gap-2">
          {isCoreRole && (
            <Tooltip
              destroyOnHidden
              title={
                <>
                  <p className="font-semibold mb-1">
                    You can&apos;t mutate core roles.
                  </p>
                  <p>Clone a core role to create a custom editable role.</p>
                </>
              }
            >
              <span className="bg-brand-primary dark:bg-secondary rounded-full p-1 text-white text-xs">
                <IconLockFilled />
              </span>
            </Tooltip>
          )}
          {role.name}
        </h3>
        <p className="text-sm text-foreground/50 dark:text-dark-foreground/50">
          {role.description}
        </p>
        <ul className="flex flex-wrap gap-2 w-full overflow-hidden max-h-12 relative mt-1">
          {role.permissions && role.permissions.length > 0 ? (
            role.permissions.slice(0, PERMISSION_LIMIT).map((permission) => (
              <li
                key={permission}
                className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 whitespace-nowrap mb-auto"
              >
                {permission}
              </li>
            ))
          ) : (
            <li className="text-xs bg-foreground/10 dark:bg-dark-foreground/10 rounded-md px-2 py-0.5 mb-auto">
              No permissions assigned
            </li>
          )}
        </ul>
        {role.permissions && role.permissions.length > PERMISSION_LIMIT && (
          <span
            className={cn(
              'text-xs absolute bottom-4 right-4',
              'bg-background dark:bg-dark-background',
              'rounded-md px-2 py-0.5 border border-foreground/10 dark:border-dark-foreground/10',
            )}
          >
            {`+ ${role.permissions.length - PERMISSION_LIMIT} more`}
          </span>
        )}
      </div>
    </div>
  );
};
