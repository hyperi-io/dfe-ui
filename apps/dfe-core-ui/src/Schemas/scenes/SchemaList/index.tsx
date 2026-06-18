'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { ListSchemaDetail } from '@/Schemas/components/ListSchemaDetail';
import { ListSchemasTree } from '@/Schemas/components/ListSchemasTree';

export const SchemaListScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.SCHEMA_READ}>
        <RbacProtected.Unrestricted>
          <ListSchemasProvider>
            <Splitter
              leftPanelContent={<ListSchemasTree />}
              rightPanelContent={<ListSchemaDetail />}
            />
          </ListSchemasProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
