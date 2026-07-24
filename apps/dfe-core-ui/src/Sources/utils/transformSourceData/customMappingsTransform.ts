export type CustomMappingsFormEntries = [string, string][] | undefined;

export const customMappingsEntriesToRecord = (
  entries: CustomMappingsFormEntries,
): Record<string, string> | undefined => {
  if (!entries?.length) {
    return undefined;
  }
  return Object.fromEntries(entries);
};

export const customMappingsRecordToEntries = (
  record: Record<string, string> | null | undefined,
): CustomMappingsFormEntries => {
  if (!record || Object.keys(record).length === 0) {
    return undefined;
  }
  return Object.entries(record);
};
