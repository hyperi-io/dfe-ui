'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListHuntsTree } from '@/Hunts/components/ListHuntsTree';
import { ViewHuntDetail } from '@/Hunts/components/ViewHuntDetail';
import { ListHuntsProvider } from '@/Hunts/contexts/ListHuntsContext';

export const HuntListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.rule_read}>
        <RbacProtected.Unrestricted>
          <ListHuntsProvider>
            <Splitter
              leftPanelContent={<ListHuntsTree />}
              rightPanelContent={<ViewHuntDetail />}
            />
          </ListHuntsProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
