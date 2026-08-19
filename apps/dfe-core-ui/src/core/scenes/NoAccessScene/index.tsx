'use client';

import { UserActionsButton } from '@/core/components/UserActionsButton';
import { cn } from '@/core/utils/style';
import { IconLock, IconPrimaryLogoFull } from '@repo/dfe-icons';

// Full-page state for an authenticated user whose roles grant no usable dfe-ui
// surface. Mirrors LoginScene's branded card so a no-access user meets a calm,
// on-brand page rather than an empty shell. The user menu stays reachable so
// they can sign out.
export const NoAccessScene = () => {
  return (
    <main
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center',
        'bg-tertiary bg-linear-to-r from-tertiary via-secondary to-brand-primary',
      )}
    >
      <div className="bg-background rounded-lg p-8 shadow-lg text-foreground max-w-md flex flex-col items-center gap-4 text-center">
        <IconPrimaryLogoFull
          className={cn('m-auto', 'text-brand-primary')}
          height={30}
          width={150}
        />
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-tertiary/10 text-tertiary">
          <IconLock className="w-6 h-6" />
        </span>
        <h1 className="text-xl font-medium">You do not have access to DFE</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your account is signed in but no roles granting access have been
          assigned to it. Please contact your administrator to request access.
        </p>
        <UserActionsButton />
      </div>
    </main>
  );
};
