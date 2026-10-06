/**
 * Editor syntax mode for one authored file.
 *
 * The extension wins over the set's declared language, because a set can
 * accept several (an enrichment table is .csv, .json, .yaml or .mmdb under one
 * `data` language). Anything unrecognised falls back to plain text rather than
 * guessing - highlighting the wrong grammar is worse than none.
 */
export const aceModeForFile = (filename: string, language: string): string => {
  const dot = filename.lastIndexOf('.');
  const suffix = dot === -1 ? '' : filename.slice(dot).toLowerCase();

  if (suffix === '.json') return 'json';
  if (suffix === '.yaml' || suffix === '.yml') return 'yaml';
  if (suffix === '.sql') return 'sql';

  if (language === 'yaml') return 'yaml';
  if (language === 'json') return 'json';

  return 'text';
};
