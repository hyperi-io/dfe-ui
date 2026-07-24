export type ObjectArrayFormEntries =
  | { key: string; value: string }[]
  | undefined;

export const objectArrayToObject = (
  entries: ObjectArrayFormEntries,
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

export const objectToObjectArray = (
  record: Record<string, string> | null | undefined,
): ObjectArrayFormEntries => {
  if (!record || Object.keys(record).length === 0) {
    return undefined;
  }
  return Object.entries(record).map(([key, value]) => ({ key, value }));
};
