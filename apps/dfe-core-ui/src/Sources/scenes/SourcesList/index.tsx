'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListSourcesTree } from '@/Sources/components/ListSourcesTree';
import { ViewSourceDetail } from '@/Sources/components/ViewSourceDetail';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';

export const SourcesListScene = () => {
  return (
    <MainContentCard>
      <ListSourcesProvider>
        <Splitter
          leftPanelContent={<ListSourcesTree />}
          rightPanelContent={<ViewSourceDetail />}
        />
      </ListSourcesProvider>
    </MainContentCard>
  );
};
