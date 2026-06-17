import { cn } from '@/core/utils/style';
import { DeleteGroupModal } from '@/Settings/components/GroupManagement/DeleteGroupModal';
import { EditGroupDrawer } from '@/Settings/components/GroupManagement/EditGroupDrawer';
import { ViewGroupDetailsDrawer } from '@/Settings/components/GroupManagement/ViewGroupDetailsDrawer';
import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { Group } from '@/Settings/hooks/useFetchGroups/types';
import { TAG_LIMIT, TagList } from './TagList';

export const GroupCard = ({
  group,
  refetch,
}: {
  group: Group;
  refetch: () => void;
}) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative h-full">
      <div className="flex flex-col gap-1">
        <PopoverMenu
          className="absolute top-1 right-1"
          ariaLabel="Group actions"
          options={[
            <ViewGroupDetailsDrawer
              group_name={group.name}
              key="view-group-details"
            />,
            <EditGroupDrawer
              key="edit-group"
              group_name={group.name}
              refetch={refetch}
            />,
            <DeleteGroupModal
              key="delete-group"
              group_name={group.name}
              refetch={refetch}
            />,
          ]}
        />

        <h3 className="font-medium">{group.name}</h3>
        <p className="text-sm text-foreground/50 dark:text-dark-foreground/50">
          {group.description || 'No description'}
        </p>

        <p className="text-xs text-foreground/40 dark:text-dark-foreground/40 mt-1">
          Roles
        </p>
        <ul className="flex flex-wrap gap-2 w-full overflow-hidden max-h-12 relative">
          <TagList items={group.roles ?? []} emptyLabel="No roles assigned" />
        </ul>
        {group.roles && group.roles.length > TAG_LIMIT && (
          <span
            className={cn(
              'text-xs self-end',
              'bg-background dark:bg-dark-background',
              'rounded-md px-2 py-0.5 border border-foreground/10 dark:border-dark-foreground/10',
            )}
          >
            {`+ ${group.roles.length - TAG_LIMIT} more`}
          </span>
        )}

        <p className="text-xs text-foreground/40 dark:text-dark-foreground/40 mt-2">
          Members
        </p>
        <ul className="flex flex-wrap gap-2 w-full overflow-hidden max-h-12">
          <TagList
            items={group.members ?? []}
            emptyLabel="No members assigned"
          />
        </ul>
        {group.members && group.members.length > TAG_LIMIT && (
          <span
            className={cn(
              'text-xs self-end',
              'bg-background dark:bg-dark-background',
              'rounded-md px-2 py-0.5 border border-foreground/10 dark:border-dark-foreground/10',
            )}
          >
            {`+ ${group.members.length - TAG_LIMIT} more`}
          </span>
        )}
      </div>
    </div>
  );
};
