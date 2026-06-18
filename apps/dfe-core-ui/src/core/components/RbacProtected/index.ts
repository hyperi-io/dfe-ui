import { UI_DISPLAY_ACTIONS } from './hooks/rbac.constants';
import { useRbac as useRbacComponent } from './hooks/useRbac';
import {
  ButtonLoader as ButtonLoaderComponent,
  RouteLoader as RouteLoaderComponent,
} from './Loaders';
import { RbacError as RbacErrorComponent } from './RbacError';
import { RbacLoader as RbacLoaderComponent } from './RbacLoader';
import { RbacProtected as RbacProtectedComponent } from './RbacProtected';
import { Restricted as RestrictedComponent } from './Restricted';
import { RestrictedRouteView as RestrictedRouteViewComponent } from './RestrictedRouteView';
import { Unrestricted as UnrestrictedComponent } from './Unrestricted';

export const RbacProtected = Object.assign(RbacProtectedComponent, {
  Unrestricted: UnrestrictedComponent,
  Restricted: RestrictedComponent,
  RestrictedRoute: RestrictedRouteViewComponent,
  RouteLoader: RouteLoaderComponent,
  ButtonLoader: ButtonLoaderComponent,
  Error: RbacErrorComponent,
  useRbac: useRbacComponent,
  rbacActions: UI_DISPLAY_ACTIONS,
  Loader: RbacLoaderComponent,
});
