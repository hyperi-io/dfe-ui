import { SourceFlowCard } from '@/core/components/flow/SourceFlowCard';
import { DEFAULT_SOURCE_NAME } from '@/core/components/flow/SourceFlowCard/defaultSource';
import { IconInfoCircle } from '@repo/dfe-icons';

/**
 * What the console shows before a source is picked: the default flow.
 *
 * Every record the receiver cannot place lands there, so it is running before
 * anyone has configured anything, and it is the first flow a new operator can
 * read end to end.
 */
export const EmptyDetail = () => {
  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto pr-4 pt-4">
      <SourceFlowCard
        source={DEFAULT_SOURCE_NAME}
        title="Default flow"
        description="Where a record the receiver cannot place lands."
      />
      <div className="flex flex-col items-center justify-center">
        <IconInfoCircle className="h-6 w-6 text-foreground" />
        <h2 className="text-xl font-medium">No source selected</h2>
        <p className="text-foreground-muted dark:text-dark-foreground-muted">
          Please add or select a source to see the detail.
        </p>
      </div>
    </div>
  );
};
