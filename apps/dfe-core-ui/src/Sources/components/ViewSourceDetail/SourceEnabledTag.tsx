import { cn } from '@/core/utils/style';
import { IconCapture, IconCaptureOff } from '@repo/dfe-icons';

export const SourceEnabledTag = ({
  enabled,
  className,
}: {
  enabled: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'border rounded-full px-4 py-1 flex items-center justify-center gap-2',
        enabled ? 'border-success text-success' : 'border-error text-error',
        className,
      )}
    >
      {enabled ? <IconCapture /> : <IconCaptureOff />}
      <span className="font-semibold">{enabled ? 'Enabled' : 'Disabled'}</span>
    </div>
  );
};
