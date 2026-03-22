import { IconInfoCircle } from '@dfe/icons';

export const EmptyDetail = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="text-foreground-muted dark:text-dark-foreground-muted">
        {description}
      </p>
    </div>
  );
};
