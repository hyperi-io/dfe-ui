import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { Button, Input, Tabs } from 'antd';
import { CRONBuilderProps } from '..';
import { Custom } from './Custom';
import { Daily } from './Daily';
import { Hourly } from './Hourly';
import { Minutes } from './Minutes';
import { Monthly } from './Monthly';
import { Weekly } from './Weekly';

export const EditCRON = ({
  onChange,
  className,
  classNames,
}: CRONBuilderProps) => {
  const { cronExpression, cronExplainer } = useCRONBuilderContext();

  const handleChange = () => {
    onChange?.(cronExpression);
  };

  return (
    <div className={cn('flex flex-col gap-y-2', className, classNames?.root)}>
      <Input value={cronExpression} readOnly className="w-full" />
      {cronExplainer && (
        <NotificationCard description={cronExplainer} type="info" />
      )}
      <Tabs
        classNames={classNames?.tabs}
        items={[
          {
            key: 'minutes',
            label: 'Minutes',
            children: <Minutes />,
          },
          {
            key: 'hourly',
            label: 'Hourly',
            children: <Hourly />,
          },
          {
            key: 'daily',
            label: 'Daily',
            children: <Daily />,
          },
          {
            key: 'weekly',
            label: 'Weekly',
            children: <Weekly />,
          },
          {
            key: 'monthly',
            label: 'Monthly',
            children: <Monthly />,
          },
          {
            key: 'custom',
            label: 'Custom',
            children: <Custom />,
          },
        ]}
      />

      <div className="flex justify-end">
        <Button
          type="primary"
          htmlType="button"
          onClick={() => {
            handleChange();
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
