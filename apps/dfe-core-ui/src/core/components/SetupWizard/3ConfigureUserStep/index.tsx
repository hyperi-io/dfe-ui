import { IconArrowLeft, IconArrowRight } from '@repo/dfe-icons';
import { Button, Card } from 'antd';

export const ConfigureUserStep = ({
  goNext,
  goPrevious,
}: {
  goNext: () => void;
  goPrevious: () => void;
}) => {
  return (
    <Card className="flex flex-col w-2/5">
      <h1 className="text-2xl font-light">Configure User</h1>

      <div className="flex flex-row justify-between mt-10">
        <Button type="text" className="text-light p-0" onClick={goPrevious}>
          <IconArrowLeft /> Back
        </Button>
        <div className="flex flex-row gap-6">
          <Button type="text" className="text-light p-0" onClick={goNext}>
            Next <IconArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  );
};
