'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import {
  ListSourcesContent,
  ListSourcesFilter,
} from '@/Sources/components/ListSources';
import { ListSourcesProvider } from '@/Sources/components/ListSources/context';

export const SourcesListScene = () => {
  return (
    <MainContentCard>
      <ListSourcesProvider>
        <Splitter
          leftPanelContent={<ListSourcesFilter />}
          rightPanelContent={<ListSourcesContent />}
        />
      </ListSourcesProvider>
    </MainContentCard>
  );
};
