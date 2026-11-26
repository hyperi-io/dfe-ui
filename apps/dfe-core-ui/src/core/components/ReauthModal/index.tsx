import { Modal } from '@/core/components/Modal';
import { ReauthPanel } from '@/core/components/ReauthPanel';
import type { TReauthKind } from '@/core/hooks/useReauth';

const KIND_NOUNS: Record<TReauthKind, string> = {
  account: 'account',
  api_key: 'API key',
  credential: 'ingest credential',
  group: 'group',
  org: 'organisation',
  provider: 'sign-in provider',
  role: 'role',
  setting: 'setting',
};

/** Asks the signed-in user to prove it is still them before it changes *target*, for a change with no confirmation panel of its own. */
export const ReauthModal = ({
  kind = 'account',
  onCancel,
  onGranted,
  open,
  target,
  verb = 'change',
}: {
  kind?: TReauthKind;
  onCancel: () => void;
  onGranted: (grant: string) => void;
  open: boolean;
  target: string;
  /** What the change does to *target*, such as create or delete. */
  verb?: string;
}) => (
  <Modal
    title="Confirm it's you"
    open={open}
    onCancel={onCancel}
    footer={null}
    destroyOnHidden
  >
    <ReauthPanel
      kind={kind}
      target={target}
      onCancel={onCancel}
      onGranted={onGranted}
    >
      <p>
        You are about to {verb} {KIND_NOUNS[kind]} <strong>{target}</strong>.
      </p>
    </ReauthPanel>
  </Modal>
);
