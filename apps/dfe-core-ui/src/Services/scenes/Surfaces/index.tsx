'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Splitter } from '@/core/components/Splitter';
import { ListSurfaceDetail } from '@/Services/components/surfaces/ListSurfaceDetail';
import { SurfacesTree } from '@/Services/components/surfaces/SurfacesTree';
import { ListSurfacesProvider } from '@/Services/contexts/ListSurfacesContext';

export const SurfacesScene = () => {
  return (
    <MainContentCard>
      <RbacProtected action={RbacProtected.rbacActions.service_surface_read}>
        <RbacProtected.Unrestricted>
          <ListSurfacesProvider>
            <Splitter
              leftPanelContent={<SurfacesTree />}
              rightPanelContent={<ListSurfaceDetail />}
            />
          </ListSurfacesProvider>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </MainContentCard>
  );
};
