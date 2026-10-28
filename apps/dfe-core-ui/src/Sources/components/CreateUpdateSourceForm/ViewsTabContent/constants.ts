/** Standards a new view can be created with. */
export const STANDARD_OPTIONS = [
  { label: 'Elastic Common Schema', value: 'ecs' },
  { label: 'Common Information Model', value: 'cim' },
  { label: 'Open Cybersecurity Schema Framework', value: 'ocsf' },
] as const;

/** The one standard whose view carries a taxonomy, category and service. */
export const SIGMA_STANDARD = 'sigma';

/** Standards the engine still accepts but a new view cannot pick. An existing view keeps its own. */
export const HIDDEN_STANDARD_OPTIONS = [
  { label: 'Sigma', value: SIGMA_STANDARD },
] as const;

/** One view per standard the engine accepts, with no duplicates. */
export const MAX_VIEWS =
  STANDARD_OPTIONS.length + HIDDEN_STANDARD_OPTIONS.length;

/** The display name of a view standard, falling back to the stored value for one the console does not know. */
export const standardLabel = (standard: string) =>
  [...STANDARD_OPTIONS, ...HIDDEN_STANDARD_OPTIONS].find(
    (option) => option.value === standard,
  )?.label ?? standard;
