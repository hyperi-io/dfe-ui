import { IconAlertCircle } from '@dfe/icons';

export const ErrorList = ({ message }: { message: string }) => {
  return (
    <div className="bg-background-muted dark:bg-dark-background-muted rounded-md p-4 flex items-center gap-6">
      <IconAlertCircle className="w-6 h-6 text-error" />
      <div className="flex flex-col">
        <h2 className="text-lg font-medium">
          There was an unexpected error loading the sources
        </h2>
        <p>{message}</p>
      </div>
    </div>
  );
};
