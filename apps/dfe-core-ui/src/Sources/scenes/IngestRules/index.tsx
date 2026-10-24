'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { DeploymentCompatibility } from '@/Sources/components/IngestRules/DeploymentCompatibility';
import { RuleOrder } from '@/Sources/components/IngestRules/RuleOrder';

/** The order the receiver's rules run in, and the compatibility profiles they include. */
export const IngestRulesScene = () => {
  const { componentHeight } = useSetComponentHeight({ offset: 100 });

  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <CustomScrollbar height={componentHeight}>
            <div className="flex max-w-6xl flex-col gap-2 pr-2">
              <RuleOrder />
              <DeploymentCompatibility />
            </div>
          </CustomScrollbar>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
