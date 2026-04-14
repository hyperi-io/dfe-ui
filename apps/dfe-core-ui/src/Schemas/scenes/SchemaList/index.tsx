'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListSchemasDetail } from '@/Schemas/components/ListSchemasDetail';
import { ListSchemasTree } from '@/Schemas/components/ListSchemasTree';
import { ListSchemasProvider } from '@/Schemas/contexts/ListSchemasContext';

export const SchemaListScene = () => {
  return (
    <MainContentCard>
      <ListSchemasProvider>
        <Splitter
          leftPanelContent={<ListSchemasTree />}
          rightPanelContent={<ListSchemasDetail />}
        />
      </ListSchemasProvider>
    </MainContentCard>
  );
};
