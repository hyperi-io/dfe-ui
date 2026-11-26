import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { UserGroups } from './UserGroups';

/** The groups an admin manages. Each organisation's admins and viewers are listed in its Users tab under Organisation Management. */
export const GroupManagement = () => (
  // CSS sizes the box before the first paint, so no scrollbar shows while JS measures the window.
  <div className="h-[calc(100dvh-100px)]">
    <CustomScrollbar>
      <UserGroups />
    </CustomScrollbar>
  </div>
);
