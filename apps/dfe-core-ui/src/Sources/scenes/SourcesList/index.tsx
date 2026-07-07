'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListSourcesTree } from '@/Sources/components/ListSourcesTree';
import { ViewSourceDetail } from '@/Sources/components/ViewSourceDetail';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';

export const SourcesListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.source_read}>
        <RbacProtected.Unrestricted>
          <ListSourcesProvider>
            <Splitter
              leftPanelContent={<ListSourcesTree />}
              rightPanelContent={
                <SourceDetailsProvider>
                  <ViewSourceDetail />
                </SourceDetailsProvider>
              }
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
