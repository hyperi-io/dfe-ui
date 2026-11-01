import { Popover } from '@/core/components/Popover';
import { cn } from '@/core/utils/style';
import { usePatchSource } from '@/Sources/hooks/usePatchSource';
import { TSourcePatchResponse } from '@/Sources/hooks/usePatchSource/types';
import { AwaitingReviewNote, awaitsReview } from '@/core/utils/sourceReview';
import { IconCapture, IconCaptureOff } from '@repo/dfe-icons';
import { Alert, Button } from 'antd';
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
  const [held, setHeld] = useState<{
    sourceName: string;
    enabled: boolean;
    review: Omit<TSourcePatchResponse, 'path'>;
  } | null>(null);

  const { mutate: patchSource, error: errorUpdateSource } = usePatchSource({
    onSuccess: (response) => {
      // Main is unchanged until the review merges, so the tag stays as it was.
      if (awaitsReview(response)) {
        setHeld({ sourceName, enabled, review: response });
        return;
      }
      setOpen(false);
    },
  });
  const heldHere =
    held?.sourceName === sourceName && held.enabled === enabled ? held : null;

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
          {heldHere ? (
            <Alert
              type="info"
              showIcon
              title={`The change to ${enabled ? 'disable' : 'enable'} ${sourceName} is awaiting review. The source stays ${enabled ? 'enabled' : 'disabled'} until it is merged.`}
              description={<AwaitingReviewNote review={heldHere.review} />}
            />
          ) : (
            <Button type="text" onClick={handlePatchSource}>
              {enabled ? 'Disable Source' : 'Enable Source'}
            </Button>
          )}
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
