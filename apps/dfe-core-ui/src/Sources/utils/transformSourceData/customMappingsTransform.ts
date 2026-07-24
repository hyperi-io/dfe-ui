export type CustomMappingsFormEntries =
  | { key: string; value: string }[]
  | undefined;

export const customMappingsEntriesToRecord = (
  entries: CustomMappingsFormEntries,
): Record<string, string> | undefined => {
  if (!entries?.length) {
    return undefined;
  }
  return entries.reduce(
    (acc, { key, value }) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
};

export const customMappingsRecordToEntries = (
  record: Record<string, string> | null | undefined,
): CustomMappingsFormEntries => {
  if (!record || Object.keys(record).length === 0) {
    return undefined;
  }
  return Object.entries(record).map(([key, value]) => ({ key, value }));
};
