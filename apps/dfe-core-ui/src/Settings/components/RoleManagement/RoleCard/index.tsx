import { cn } from '@/core/utils/style';
import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { Role } from '@/Settings/mocks/role.data';
import { IconLockFilled } from '@repo/dfe-icons';
import { CloneRoleDrawer } from '../CloneRoleDrawer';
import { DeleteRoleDrawer } from '../DeleteRoleDrawer';
import { EditRoleDrawer } from '../EditRoleDrawer';
import { ViewRoleDetailsDrawer } from '../ViewRoleDetailsDrawer';

const PERMISSION_LIMIT = 4;

export const RoleCard = ({ role }: { role: Role }) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative h-full">
      <div className="flex flex-col gap-1">
        <PopoverMenu
          ariaLabel="Role actions"
          options={[
            <ViewRoleDetailsDrawer />,
            <EditRoleDrawer disabled={role.predefined ?? false} />,
            <CloneRoleDrawer />,
            <DeleteRoleDrawer disabled={role.predefined ?? false} />,
          ]}
        />

        <h3 className="font-medium">{role.name}</h3>
        <p className="text-sm text-foreground/50 dark:text-dark-foreground/50">
          {role.description}
        </p>
        <ul className="flex flex-wrap gap-2 w-full overflow-hidden max-h-12 relative">
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
      {role.predefined && (
        <span className="absolute bottom-1 right-1 bg-brand-primary dark:bg-secondary rounded-full p-1 text-white text-xs">
          <IconLockFilled />
        </span>
      )}
    </div>
  );
};
