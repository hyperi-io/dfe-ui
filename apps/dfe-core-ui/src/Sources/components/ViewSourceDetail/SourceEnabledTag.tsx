import { Popover } from '@/core/components/Popover';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { usePatchSource } from '@/Sources/hooks/usePatchSource';
import { TSourcePatchResponse } from '@/Sources/hooks/usePatchSource/types';
import { AwaitingReviewNote, awaitsReview } from '@/Sources/utils/sourceReview';
import {
  DORMANT_HINT,
  SOURCE_STATE_LABEL,
  type SourceState,
  sourceState,
} from '@/Sources/utils/sourceState';
import { IconCapture, IconCaptureOff, IconPlayerPause } from '@repo/dfe-icons';
import { Alert, Button } from 'antd';
import { type ReactNode, useState } from 'react';

const CHIP_CLASS: Record<SourceState, string> = {
  active: 'border-success text-success',
  dormant:
    'border-foreground/40 text-foreground/70 dark:border-dark-foreground/40 dark:text-dark-foreground/70',
  disabled: 'border-error text-error',
};

const CHIP_ICON: Record<SourceState, ReactNode> = {
  active: <IconCapture />,
  dormant: <IconPlayerPause />,
  disabled: <IconCaptureOff />,
};

export const SourceEnabledTag = ({
  enabled,
  state,
  className,
  sourceName,
}: {
  enabled: boolean;
  /** Absent on an engine that has no dormant state, where `enabled` decides. */
  state?: SourceState;
  className?: string;
  sourceName: string;
}) => {
  const current = sourceState({ state, enabled });
  const chipClassName = cn(
    'border rounded-full px-4 py-1 flex items-center justify-center gap-2',
    CHIP_CLASS[current],
    className,
  );
  const chipBody = (
    <>
      {CHIP_ICON[current]}
      <span className="font-semibold">{SOURCE_STATE_LABEL[current]}</span>
    </>
  );
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
    <div className={chipClassName}>{chipBody}</div>
  ) : (
    <Popover
      destroyOnHidden
      content={
        <>
          {heldHere ? (
            <Alert
              className="w-96 max-w-[80vw]"
              type="info"
              showIcon
              title={`The change to ${enabled ? 'disable' : 'enable'} ${sourceName} is awaiting review. The source stays ${SOURCE_STATE_LABEL[current].toLowerCase()} until it is merged.`}
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
      {/* The hint opens below the chip, where the popover's Enable button
          sits, so it stays shut while the popover is open. */}
      <Tooltip
        title={current === 'dormant' ? DORMANT_HINT : undefined}
        open={open ? false : undefined}
      >
        <button type="button" className={chipClassName}>
          {chipBody}
        </button>
      </Tooltip>
    </Popover>
  );
};
