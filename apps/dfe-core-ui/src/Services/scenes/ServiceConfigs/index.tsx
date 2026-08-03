'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListServiceConfigDetail } from '@/Services/components/serviceConfigs/ListServiceConfigDetail';
import { ServicesTree } from '@/Services/components/serviceConfigs/ServicesTree';
import { ListServicesProvider } from '@/Services/contexts/ListServicesContext';

export const ServiceConfigsScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.service_read}>
        <RbacProtected.Unrestricted>
          <ListServicesProvider>
            <Splitter
              leftPanelContent={<ServicesTree />}
              rightPanelContent={<ListServiceConfigDetail />}
            />
          </ListServicesProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
