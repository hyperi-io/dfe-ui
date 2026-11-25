/** The group a test chooses through the stand-in. */
export const STAND_IN_GROUP = 'sys-analysts';

/** A checkbox in place of the group picker, which reads RBAC and the groups list: ticking it chooses one group. */
export const AccountGroupSelectStandIn = ({
  onChange,
  value,
}: {
  onChange?: (groups: string[]) => void;
  value?: string[];
}) => (
  <input
    aria-label="Choose a group"
    checked={Boolean(value?.length)}
    onChange={(event) =>
      onChange?.(event.target.checked ? [STAND_IN_GROUP] : [])
    }
    type="checkbox"
  />
);
