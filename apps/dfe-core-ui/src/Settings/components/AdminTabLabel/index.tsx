export const AdminTabLabel = ({
  label,
  description,
}: {
  label: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-1 text-left max-w-60 h-full">
      <p className="text-base font-semibold">{label}</p>
      <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs whitespace-normal">
        {description}
      </span>
    </div>
  );
};
