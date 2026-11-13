'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { IngestProcedures } from '@/Sources/components/IngestProcedures';

/** The order the receiver's rules run in, and the compatibility profiles they include. */
export const IngestRulesScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <IngestProcedures />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
