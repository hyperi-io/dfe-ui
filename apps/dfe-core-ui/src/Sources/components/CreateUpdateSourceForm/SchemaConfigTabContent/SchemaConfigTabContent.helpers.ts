export const getInitialAssignSchema = ({
  meta_schema,
}: {
  meta_schema: string | null;
}) => {
  if (!meta_schema) {
    return 'default';
  }
  return 'define_schema';
};
