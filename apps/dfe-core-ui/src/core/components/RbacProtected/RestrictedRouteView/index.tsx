import { IconAlertTriangle } from '@repo/dfe-icons';

export const RestrictedRouteView = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full">
      <IconAlertTriangle className="text-orange-500 dark:text-yellow-500 mb-4 text-3xl" />
      <p className="text-lg font-medium">
        You do not have sufficient permissions to view this page.
      </p>
      <p>Please contact your administrator to request access.</p>
    </div>
  );
};
