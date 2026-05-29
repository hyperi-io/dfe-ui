'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { Splitter } from '@/core/components/Splitter';
import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { ListSchemaDetail } from '@/Schemas/components/ListSchemaDetail';
import { ListSchemasTree } from '@/Schemas/components/ListSchemasTree';

export const SchemaListScene = () => {
  return (
    <MainContentCard>
      <ListSchemasProvider>
        <Splitter
          leftPanelContent={<ListSchemasTree />}
          rightPanelContent={<ListSchemaDetail />}
        />
      </ListSchemasProvider>
    </MainContentCard>
  );
};
