import { IconInfoCircle } from '@dfe/icons';

export const TableEmpty = () => {
  return (
    <div className="bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex items-center gap-3">
      <IconInfoCircle className="w-4 h-4" />

      <h2 className="text-sm font-medium">No data found</h2>
    </div>
  );
};
