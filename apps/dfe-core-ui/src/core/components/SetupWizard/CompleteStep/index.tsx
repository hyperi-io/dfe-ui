import { cn } from '@/core/utils/style';
import { IconArrowLeft } from '@repo/dfe-icons';
import { Button } from 'antd';

export const CompleteStep = ({ goPrevious }: { goPrevious: () => void }) => {
  return (
    <div className="text-white flex flex-col w-2/5">
      <h1 className="text-4xl font-light">Complete</h1>
      <p className={cn('text-lg font-extralight mr-auto', 'css-typing')}>
        Let&apos;s get you set up.
      </p>
      <div className="flex flex-row justify-between mt-10">
        <Button
          type="text"
          className="text-white text-light p-0"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>
      </div>
    </div>
  );
};
