export const INTAKE_OPTIONS_MAP = Object.freeze({
  beats: 'Beats',
  receiver: 'Pushed to the receiver',
  fetcher: 'Pulled by a fetcher',
});

export const INTAKE_OPTIONS = Object.entries(INTAKE_OPTIONS_MAP).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
