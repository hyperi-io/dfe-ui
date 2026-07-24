export const STANDARD_OPTIONS = [
  { label: 'Sigma', value: 'sigma' },
  { label: 'Elastic Common Schema', value: 'ecs' },
  { label: 'Common Information Model', value: 'cim' },
  { label: 'Open Cybersecurity Framework', value: 'ocsf' },
] as const;

/** One view per naming standard; no duplicates. */
export const MAX_VIEWS = STANDARD_OPTIONS.length;
