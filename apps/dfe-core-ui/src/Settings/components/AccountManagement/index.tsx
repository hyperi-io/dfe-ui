'use client';

import { SectionCard } from '@/core/components/SectionCard';
import { InviteUserDrawer } from './InviteUserDrawer';
import { ViewBlockedUserListSection } from './ViewBlockedUserListSection';
import { ViewUserListSection } from './ViewUserListSection';

export const AccountManagement = () => {
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      {/* <SectionCard
        title="Link a new account"
        description="Link an external identity to the platform (coming soon)."
        rightTitleSlot={<LinkAccountDrawer />}
      /> */}
      <SectionCard
        title="Invite a new user"
        description="Create a local user account and assign group memberships."
        rightTitleSlot={<InviteUserDrawer />}
      />
      <ViewUserListSection />
      <ViewBlockedUserListSection />
    </div>
  );
};
