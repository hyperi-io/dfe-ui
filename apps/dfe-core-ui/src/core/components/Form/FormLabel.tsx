export const FormLabel = ({
  required = false,
  children,
}: {
  required?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <span className="flex items-center">
      {children} {required ? <span className="text-error ml-1">*</span> : ''}
    </span>
  );
};
