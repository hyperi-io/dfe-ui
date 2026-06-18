import { UserGroups } from './UserGroups';

/** Tab shell for future organisation-scoped groups; mirrors RoleManagement layout. */
export const GroupManagement = () => {
  return (
    <div className="min-w-0 h-[calc(100vh-100px)] css-custom-scrollbar">
      <UserGroups />
    </div>
  );
};
