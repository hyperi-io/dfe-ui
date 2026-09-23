import { Tooltip } from '@/core/components/Tooltip';
import { Button } from 'antd';

export const SkipForNow = ({
  goNext,
  title = 'You can always configure this later in the app.',
}: {
  goNext: () => void;
  title?: React.ReactNode;
}) => {
  return (
    <Tooltip destroyOnHidden title={title}>
      <Button
        type="text"
        className="text-dark-foreground-muted text-light"
        onClick={goNext}
      >
        Skip for now
      </Button>
    </Tooltip>
  );
};
