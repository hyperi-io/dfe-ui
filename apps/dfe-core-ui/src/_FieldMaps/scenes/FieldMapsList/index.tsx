'use client';

import { FieldMapsDetail } from '@/_FieldMaps/components/FieldMapsDetail';
import { FieldMapsTree } from '@/_FieldMaps/components/FieldMapsTree';
import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';

export const FieldMapsListScene = () => {
  return (
    <MainContentCard>
      <ListFieldMapsProvider>
        <Splitter
          leftPanelContent={<FieldMapsTree />}
          rightPanelContent={<FieldMapsDetail />}
        />
      </ListFieldMapsProvider>
    </MainContentCard>
  );
};
