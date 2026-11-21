export type SourceState = 'active' | 'dormant' | 'disabled';

/** What the console calls each state, in the case a chip or a sentence wants. */
export const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  active: 'Enabled',
  dormant: 'Dormant',
  disabled: 'Disabled',
};

/** What a dormant source is, as the engine defines it: kept, but nothing flows. */
export const DORMANT_HINT =
  'Dormant: the table and the receiver match are kept, but the receiver routes nothing to this source and no transform runs for it. Enable it to resume.';

/**
 * The lifecycle state of a source.
 *
 * An engine that sends `enabled` alone has no dormant state, so it reads as
 * enabled or disabled.
 */
export const sourceState = ({
  state,
  enabled,
}: {
  state?: SourceState;
  enabled: boolean;
}): SourceState => state ?? (enabled ? 'active' : 'disabled');
