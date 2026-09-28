'use client';

import { AdminLinksPanel } from '@/AdminTools/components/AdminLinksPanel';
import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';

export const AdminToolsScene = () => (
  <MainContentCard>
    <RbacProtected
      action={RbacProtected.rbacActions.deployment_admin_links_read}
    >
      <RbacProtected.Unrestricted>
        <AdminLinksPanel />
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted className="h-full">
        <RbacProtected.RestrictedRoute />
      </RbacProtected.Restricted>
    </RbacProtected>
  </MainContentCard>
);
