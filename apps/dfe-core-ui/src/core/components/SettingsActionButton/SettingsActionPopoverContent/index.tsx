'use client';

import { UserDetailsCard } from './UserDetailsCard';

export const SettingsActionPopoverContent = () => {
  return (
    <div className="flex min-w-48 flex-col gap-y-3">
      <UserDetailsCard />
    </div>
  );
};
