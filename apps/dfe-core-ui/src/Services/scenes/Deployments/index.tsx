'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { DeploymentsTree } from '@/Services/components/deployments/DeploymentsTree';
import { ListDeploymentDetail } from '@/Services/components/deployments/ListDeploymentDetail';
import { ListDeploymentsProvider } from '@/Services/contexts/ListDeploymentsContext';

export const DeploymentsScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.deployment_read}>
        <RbacProtected.Unrestricted>
          <ListDeploymentsProvider>
            <Splitter
              leftPanelContent={<DeploymentsTree />}
              rightPanelContent={<ListDeploymentDetail />}
            />
          </ListDeploymentsProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
