'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListServicesProvider } from '@/core/contexts/ListServicesContext';
import { ServicesDetail } from '@/Services/components/ServicesDetail';
import { ServicesTree } from '@/Services/components/ServicesTree';

export const ServicesListScene = () => {
  return (
    <MainContentCard>
      <ListServicesProvider>
        <Splitter
          leftPanelContent={<ServicesTree />}
          rightPanelContent={<ServicesDetail />}
        />
      </ListServicesProvider>
    </MainContentCard>
  );
};
