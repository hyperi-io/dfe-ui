'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ServiceConfigDetail } from '@/Services/components/ServiceConfigDetail';
import { ServicesTree } from '@/Services/components/ServicesTree';
import { ListServicesProvider } from '@/Services/contexts/ListServicesContext';

export const ServicesListScene = () => {
  return (
    <MainContentCard>
      <ListServicesProvider>
        <Splitter
          leftPanelContent={<ServicesTree />}
          rightPanelContent={<ServiceConfigDetail />}
        />
      </ListServicesProvider>
    </MainContentCard>
  );
};
