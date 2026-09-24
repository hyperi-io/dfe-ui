'use client';

import { SectionCard } from '@/core/components/SectionCard';
import { InviteUserDrawer } from './InviteUserDrawer';
import { SecurityAccountsDrawer } from './SecurityAccountsDrawer';
import { ViewBlockedUserListSection } from './ViewBlockedUserListSection';
import { ViewUserListSection } from './ViewUserListSection';

export const AccountManagement = () => {
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
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
    </div>
  );
};
