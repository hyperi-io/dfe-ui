import { UI_DISPLAY_ACTIONS } from '@/core/components/RbacProtected/hooks/rbac.constants';
import { isUserAuthorized } from '@/core/components/RbacProtected/hooks/useRbac.helpers';

const SOURCES_PATH = '/sources';
const OBSERVE_SEARCH_PATH = '/observe/search';

/**
 * Where `/` sends a signed-in user. A reader who cannot change sources starts
 * at Search when HyperDX is configured, everyone else at Sources.
 *
 * `hyperdx` is the configured HyperDX URL or port.
 */
export const landingPath = (
  permissions: ReadonlySet<string>,
  hyperdx?: string,
): string =>
  hyperdx &&
  isUserAuthorized(permissions, UI_DISPLAY_ACTIONS.dashboard_read) &&
  !isUserAuthorized(permissions, UI_DISPLAY_ACTIONS.source_write)
    ? OBSERVE_SEARCH_PATH
    : SOURCES_PATH;
