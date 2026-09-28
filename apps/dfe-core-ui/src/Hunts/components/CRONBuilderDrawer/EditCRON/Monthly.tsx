import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import {
  parseCronExpression,
  resetCronExpression,
} from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, Radio, Select } from 'antd';
import { useState } from 'react';

type MonthlyType = 'day' | 'last' | 'lastweekday' | 'before' | 'custom';

const getDaysValue = (days: string) => {
  return days.includes(',') ? days.split(',').map(Number) : [Number(days)];
};

export const Monthly = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const [monthlyType, setMonthlyType] = useState<MonthlyType>('day');
  const { day } = parseCronExpression(cronExpression);
  const { ...resetCron } = parseCronExpression(resetCronExpression('monthly'));
  const daysValue = getDaysValue(day);

  const [customDays, setCustomDays] = useState<Set<number>>(new Set(daysValue));
  const [beforeDays, setBeforeDays] = useState<number>(1);

  const resetMonthly = () => {
    updateCronExpression({
      atomic: { ...resetCron, cmd: undefined },
    });
    setCustomDays(new Set([1]));
    setBeforeDays(1);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <Radio.Group
        className="flex flex-col gap-y-3"
        value={monthlyType}
        onChange={(e) => {
          setMonthlyType(e.target.value);
          resetMonthly();

          if (e.target.value === 'last') {
            return updateCronExpression({
              atomic: { day: '*', month: 'L', cmd: '?' },
            });
          }
          if (e.target.value === 'lastweekday') {
            return updateCronExpression({ atomic: { month: 'LW', cmd: '?' } });
          }
          if (e.target.value === 'before') {
            return updateCronExpression({
              atomic: { day: '*', month: `L-${beforeDays ?? 1}`, cmd: '?' },
            });
          }
          if (e.target.value === 'custom') {
            return updateCronExpression({
              atomic: {
                day: Array.from(customDays).join(','),
                month: '*',
                cmd: undefined,
              },
            });
          }
        }}
      >
        <Radio value="day">Specific day of the month</Radio>
        <Radio value="last">Last day of every month</Radio>
        <Radio value="lastweekday">On the last weekday of the month</Radio>
        <Radio value="before">Custom days before end of month</Radio>
        <Radio value="custom">Custom days of every month</Radio>
      </Radio.Group>

      {monthlyType === 'day' && (
        <div className="flex flex-col gap-y-2">
          <label htmlFor="day">Day of the month</label>
          <InputNumber
            id="day"
            min={1}
            max={31}
            value={daysValue[0]}
            onChange={(val) => {
              updateCronExpression({
                atomic: { day: val?.toString() ?? '*' },
              });
            }}
          />
        </div>
      )}

      {monthlyType === 'before' && (
        <div className="flex flex-col gap-y-2">
          <label htmlFor="day">Custom days before end of month</label>
          <InputNumber
            id="before"
            min={1}
            max={31}
            value={beforeDays}
            onChange={(val) => {
              setBeforeDays(val ?? 1);
              updateCronExpression({
                atomic: { month: `L-${val?.toString() ?? '1'}`, cmd: '?' },
              });
            }}
          />
        </div>
      )}

      {monthlyType === 'custom' && (
        <Select
          mode="tags"
          options={Array.from({ length: 31 }, (_, i) => ({
            label: (i + 1).toString(),
            value: (i + 1).toString(),
          }))}
          value={Array.from(customDays).map(String)}
          onChange={(vals) => {
            const days = vals
              .map((value) => parseInt(value, 10))
              .filter((day) => !Number.isNaN(day) && day >= 1 && day <= 31);
            setCustomDays(new Set(days));
            updateCronExpression({
              atomic: { day: days.join(',') },
            });
          }}
          allowClear
          onClear={() => {
            setCustomDays(new Set());
            updateCronExpression({
              raw: resetCronExpression('monthly'),
            });
          }}
          tokenSeparators={[',']}
          placeholder="e.g. 1,15,28"
        />
      )}
    </div>
  );
};
