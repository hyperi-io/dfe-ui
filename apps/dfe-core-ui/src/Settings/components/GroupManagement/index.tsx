import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { UserGroups } from './UserGroups';

/** Tab shell for future organisation-scoped groups; mirrors RoleManagement layout. */
export const GroupManagement = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  return (
    <CustomScrollbar height={componentHeight}>
      <UserGroups />
    </CustomScrollbar>
  );
};
