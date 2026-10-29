import { IconAlertTriangle } from '@repo/dfe-icons';

export const RestrictedRouteView = ({
  showIcon = true,
  reason,
}: {
  showIcon?: boolean;
  /** The engine's own words for the refusal, when it gave any. */
  reason?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full text-center">
      {showIcon && (
        <IconAlertTriangle className="text-orange-500 dark:text-yellow-500 text-3xl" />
      )}
      <p className="text-lg font-medium">
        You do not have sufficient permissions
      </p>
      {reason && <p>{reason}</p>}
      <p>Please contact your administrator to request access.</p>
    </div>
  );
};
