'use client';

import { CHANGE_PASSWORD_PATH } from '@/core/config/authSession';
import { navigateWithReload } from '@/core/utils/navigation';

/** Send the browser to the change screen, since the engine refuses everything else until then. */
export function handlePasswordChangeRequired(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (window.location.pathname.startsWith(CHANGE_PASSWORD_PATH)) {
    return;
  }
  navigateWithReload(CHANGE_PASSWORD_PATH);
}
