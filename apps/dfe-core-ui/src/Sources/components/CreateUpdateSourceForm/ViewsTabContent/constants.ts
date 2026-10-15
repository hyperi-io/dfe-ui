/** Standards a new view can be created with. */
export const STANDARD_OPTIONS = [
  { label: 'Elastic Common Schema', value: 'ecs' },
  { label: 'Common Information Model', value: 'cim' },
  { label: 'Open Cybersecurity Schema Framework', value: 'ocsf' },
] as const;

/** Standards the engine still accepts but a new view cannot pick. An existing view keeps its own. */
export const HIDDEN_STANDARD_OPTIONS = [
  { label: 'Sigma', value: 'sigma' },
] as const;

/** One view per standard the engine accepts, with no duplicates. */
export const MAX_VIEWS =
  STANDARD_OPTIONS.length + HIDDEN_STANDARD_OPTIONS.length;
