import { cn } from '@/core/utils/style';
import { IconArrowRight } from '@repo/dfe-icons';
import { Button } from 'antd';

export const WelcomeStep = ({ goNext }: { goNext: () => void }) => {
  return (
    <div className="text-white flex flex-col w-2/5">
      <h1 className="text-4xl font-light">Welcome to Data Fusion Engine</h1>
      <p className={cn('text-lg font-extralight mr-auto', 'css-typing')}>
        Let&apos;s get you set up.
      </p>
      <div className="flex flex-row justify-between mt-10">
        <div className="flex flex-row gap-6 ml-auto">
          <Button
            type="text"
            className="text-light p-0 pl-2 text-white"
            onClick={goNext}
          >
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
