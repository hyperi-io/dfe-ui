'use client';

import { Modal } from '@/core/components/Modal';
import { NotificationCard } from '@/core/components/NotificationCard';
import { IconArrowNarrowRight } from '@repo/dfe-icons';
import { Button } from 'antd';

/**
 * The name of one side of the switch, sized to sit level with the arrow.
 *
 * `break-all` because a service name is one unbroken token and the modal is
 * narrow on a phone: without it the name leaves the dialog.
 */
const SwitchEnd = ({ service }: { service: string }) => (
  <span className="min-w-0 break-all font-medium">{service}</span>
);

/**
 * What a transform switch costs, before it is made.
 *
 * The source, not the operator, decides which transform app runs, so this names
 * the app that goes as plainly as the one that arrives - undeploying the working
 * one by hand was how the previous surface asked for the same change.
 */
export const SwitchTransformModal = ({
  open,
  source,
  from,
  to,
  isPending,
  refused,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  source: string;
  from: string | null;
  to: string | null;
  isPending: boolean;
  /** The deployment has already refused this engine for this source. */
  refused?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal
    title={
      from
        ? `Switch the transform for ${source}`
        : `Set the transform for ${source}`
    }
    open={open}
    onCancel={onCancel}
    // Without this the closed dialog keeps its text in the DOM, where the
    // refusal reads as a second copy of the one on the option.
    destroyOnHidden
    footer={
      <>
        <Button
          type="primary"
          loading={isPending}
          disabled={isPending || refused}
          onClick={onConfirm}
        >
          {from ? 'Switch transform' : 'Set transform'}
        </Button>
        <Button type="default" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
      </>
    }
  >
    <div className="flex flex-col gap-3">
      {from && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <SwitchEnd service={from} />
          <IconArrowNarrowRight
            aria-hidden="true"
            className="shrink-0 text-foreground/50 dark:text-dark-foreground/50"
          />
          <SwitchEnd service={to ?? ''} />
        </div>
      )}
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
        <li>
          {from
            ? `${to} takes over from ${from}, and ${from} stops running for this source.`
            : `${to} starts running for this source.`}
        </li>
        <li>
          A source has one transform, so nothing else changes on the path.
        </li>
        <li>
          Transform files stay in the library. Each engine runs its own, so the
          new one starts with the files it already has.
        </li>
        <li>
          A source that is already deployed records this as a new version.
          Records move through the new transform once that version is deployed.
        </li>
      </ul>
      {error && <NotificationCard type="error" title={error} />}
    </div>
  </Modal>
);
