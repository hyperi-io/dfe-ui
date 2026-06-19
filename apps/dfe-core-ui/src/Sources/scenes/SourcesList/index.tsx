'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListSourcesTree } from '@/Sources/components/ListSourcesTree';
import { ViewSourceDetail } from '@/Sources/components/ViewSourceDetail';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';

export const SourcesListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <ListSourcesProvider>
            <Splitter
              leftPanelContent={<ListSourcesTree />}
              rightPanelContent={<ViewSourceDetail />}
            />
          </ListSourcesProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
