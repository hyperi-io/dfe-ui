import { Tooltip } from '@/core/components/Tooltip';
import { IconLink } from '@repo/dfe-icons';

const THROUGH_LINK = 'Holds this group through its identity provider';

/** An account that holds the group through an IdP sign-in its link matches, not as a stored member. */
export const LinkedMemberName = ({ username }: { username: string }) => (
  <Tooltip destroyOnHidden title={THROUGH_LINK}>
    <span className="inline-flex items-center gap-1">
      <IconLink aria-label={THROUGH_LINK} />
      {username}
    </span>
  </Tooltip>
);
