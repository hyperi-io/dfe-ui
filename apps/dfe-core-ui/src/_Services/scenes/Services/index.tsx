'use client';

import { ServicesDetail } from '@/_Services/components/ServicesDetail';
import { ServicesTree } from '@/_Services/components/ServicesTree';
import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListServicesProvider } from '@/core/contexts/ListServicesContext';

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
