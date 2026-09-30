'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { SectionCard } from '@/core/components/SectionCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { InviteUserDrawer } from './InviteUserDrawer';
import { SecurityAccountsDrawer } from './SecurityAccountsDrawer';
import { ViewBlockedUserListSection } from './ViewBlockedUserListSection';
import { ViewUserListSection } from './ViewUserListSection';

export const AccountManagement = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  return (
    <CustomScrollbar height={componentHeight}>
      <SectionCard
        title="Invite a new user"
        description="Create a local user account and assign group memberships."
        rightTitleSlot={<InviteUserDrawer />}
      />
      <SectionCard
        title="Security accounts"
        description="View and manage security accounts."
        rightTitleSlot={<SecurityAccountsDrawer />}
      />
      <ViewUserListSection />
      <ViewBlockedUserListSection />
    </CustomScrollbar>
  );
};
