'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';

export const PlatformScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.lifecycle_read}>
        <RbacProtected.Unrestricted>
          <div>Platform</div>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
