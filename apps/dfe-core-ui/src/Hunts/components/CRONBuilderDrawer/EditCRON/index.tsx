import { NotificationCard } from '@/core/components/NotificationCard';
import { cn } from '@/core/utils/style';
import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { resetCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { Button, Input, Tabs } from 'antd';
import { useState } from 'react';
import { CRONBuilderProps } from '..';
import { Custom } from './Custom';
import { Daily } from './Daily';
import { Hourly } from './Hourly';
import { Minutes } from './Minutes';
import { Monthly } from './Monthly';
import { Weekly } from './Weekly';

type TabKey = 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
export const EditCRON = ({
  onChange,
  className,
  classNames,
}: CRONBuilderProps) => {
  const [tabKey, setTabKey] = useState<TabKey>('minutes');
  const { cronExpression, cronExplainer, updateCronExpression } =
    useCRONBuilderContext();

  const handleChange = () => {
    onChange?.(cronExpression);
  };

  return (
    <div className={cn('flex flex-col gap-y-2', className, classNames?.root)}>
      <label htmlFor="cron-expression">Generated Expression</label>
      <Input value={cronExpression} readOnly className="w-full" disabled />
      {(cronExplainer.explainer || cronExplainer.error) && (
        <NotificationCard
          description={cronExplainer.explainer || cronExplainer.error}
          type={cronExplainer.error ? 'error' : 'info'}
        />
      )}
      <Tabs
        classNames={classNames?.tabs}
        onChange={(key) => {
          const nextTab = key as TabKey;
          setTabKey(nextTab);
          const nextCron = resetCronExpression(nextTab);
          if (nextCron) {
            updateCronExpression({ raw: nextCron });
          }
        }}
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
            children: (
              <div className="flex flex-col gap-y-2">
                <Hourly />
                <Daily />
              </div>
            ),
          },
          {
            key: 'weekly',
            label: 'Weekly',
            children: (
              <div className="flex flex-col gap-y-2">
                <Hourly />
                <Weekly />
              </div>
            ),
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

      <div className="flex justify-end gap-x-2">
        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            updateCronExpression({
              raw: resetCronExpression(tabKey),
            });
          }}
        >
          Reset
        </Button>
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
