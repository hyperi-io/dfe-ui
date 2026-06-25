'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListHuntsTree } from '@/Hunts/components/ListHuntsTree';
import { ViewHuntDetail } from '@/Hunts/components/ViewHuntDetail';
import { ListHuntsProvider } from '@/Hunts/contexts/ListHuntsContext';

export const HuntListScene = () => {
  return (
    <MainContentCard>
      <ListHuntsProvider>
        <Splitter
          leftPanelContent={<ListHuntsTree />}
          rightPanelContent={<ViewHuntDetail />}
        />
      </ListHuntsProvider>
    </MainContentCard>
  );
};
