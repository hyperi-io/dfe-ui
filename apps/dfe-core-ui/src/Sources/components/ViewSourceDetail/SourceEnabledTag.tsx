import { cn } from '@/core/utils/style';
import { usePatchSource } from '@/Sources/hooks/usePatchSource';
import { IconCapture, IconCaptureOff } from '@repo/dfe-icons';
import { Alert, Button, Popover } from 'antd';
import { useState } from 'react';

export const SourceEnabledTag = ({
  enabled,
  className,
  sourceName,
}: {
  enabled: boolean;
  className?: string;
  sourceName: string;
}) => {
  const [open, setOpen] = useState(false);

  const { mutate: patchSource, error: errorUpdateSource } = usePatchSource({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const handlePatchSource = () => {
    patchSource({
      name: sourceName,
      enabled: !enabled,
    });
  };
  return sourceName === 'main' ? (
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
  ) : (
    <Popover
      destroyOnHidden
      content={
        <>
          <Button type="text" onClick={handlePatchSource}>
            {enabled ? 'Disable Source' : 'Enable Source'}
          </Button>
          {errorUpdateSource && (
            <Alert description={errorUpdateSource.message} type="error" />
          )}
        </>
      }
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottom"
    >
      <button
        type="button"
        className={cn(
          'border rounded-full px-4 py-1 flex items-center justify-center gap-2',
          enabled ? 'border-success text-success' : 'border-error text-error',
          className,
        )}
      >
        {enabled ? <IconCapture /> : <IconCaptureOff />}
        <span className="font-semibold">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </button>
    </Popover>
  );
};
