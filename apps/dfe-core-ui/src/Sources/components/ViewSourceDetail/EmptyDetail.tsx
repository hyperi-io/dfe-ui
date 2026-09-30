import { IconInfoCircle } from '@repo/dfe-icons';

export const EmptyDetail = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6 pr-4 pt-4">
      <div className="flex flex-col items-center justify-center">
        <IconInfoCircle className="h-6 w-6 text-foreground" />
        <h2 className="text-xl font-medium">No source selected</h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          Select a source to see the detail.
        </p>
      </div>
    </div>
  );
};
