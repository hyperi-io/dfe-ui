import { IconInfoCircle } from '@repo/dfe-icons';

export const EmptyDetail = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-col">
      <IconInfoCircle className="w-6 h-6 text-foreground" />
      <h2 className="text-xl font-medium">No deployment selected</h2>
      <p className="text-foreground-muted dark:text-dark-foreground-muted">
        Please add or select a deployment to see the detail.
      </p>
    </div>
  );
};
