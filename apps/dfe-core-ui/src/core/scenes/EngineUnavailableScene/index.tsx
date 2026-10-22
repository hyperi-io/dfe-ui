'use client';

import { GenericErrorPage } from '@/core/components/GenericError';
import { navigateWithReload } from '@/core/utils/navigation';
import { IconRefresh } from '@repo/dfe-icons';
import { Button } from 'antd';

// Full-page state for a console whose engine does not answer. The proxy serves
// it, with a 503, in place of any page that reads the engine on render, so the
// reload re-requests the URL the user is on.
export const EngineUnavailableScene = () => (
  <GenericErrorPage
    className="min-h-screen w-full px-4"
    title="Cannot reach the DFE engine"
    description="The console could not connect to the engine. Check that it is running, then try again."
    action={
      <Button
        className="mt-6"
        icon={<IconRefresh />}
        onClick={() => navigateWithReload(window.location.href)}
      >
        Try again
      </Button>
    }
  />
);
