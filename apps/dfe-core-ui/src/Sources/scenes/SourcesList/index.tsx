'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { EditSourceDetail } from '@/Sources/components/EditSourceDetail';
import { ListSourcesTree } from '@/Sources/components/ListSourcesTree';
import { ListSourcesProvider } from '@/Sources/contexts/ListSourcesContext';

export const SourcesListScene = () => {
  return (
    <MainContentCard>
      <ListSourcesProvider>
        <Splitter
          leftPanelContent={<ListSourcesTree />}
          rightPanelContent={<EditSourceDetail />}
        />
      </ListSourcesProvider>
    </MainContentCard>
  );
};
