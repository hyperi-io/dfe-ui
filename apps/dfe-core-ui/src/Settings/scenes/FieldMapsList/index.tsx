'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListFieldMapsProvider } from '@/core/contexts/ListFieldMapsContext';
import { FieldMapsDetail } from '@/Settings/components/FieldMapsDetail';
import { FieldMapsTree } from '@/Settings/components/FieldMapsTree';

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
