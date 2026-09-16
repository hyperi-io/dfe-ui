export const isDefaultOveridden = (
  initialValue: string | undefined,
  defaultValue: string | undefined,
) => {
  return (
    initialValue !== undefined &&
    initialValue !== null &&
    initialValue !== defaultValue
  );
};
