import { cn } from '@/core/utils/style';
import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';

export const CompleteStep = ({ goPrevious }: { goPrevious: () => void }) => {
  const router = useRouter();

  return (
    <div className="text-white flex flex-col w-2/5">
      <h1 className="text-4xl font-light">Complete</h1>
      <p className={cn('text-lg font-extralight mr-auto', 'css-typing')}>
        Congratulations! You have successfully configured the system.
      </p>
      <div className="flex flex-row justify-between mt-10">
        <Button
          type="text"
          className="text-white text-light p-0"
          onClick={goPrevious}
        >
          <IconArrowLeft /> Back
        </Button>

        <Button
          type="text"
          className="text-white text-light p-0"
          onClick={() => router.push('/login')}
        >
          Login <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};
