import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, InputProps, Radio } from 'antd';
import { useState } from 'react';
import { FrequencyType } from './types';

export const Daily = ({ onChange: _onChange, ..._props }: InputProps) => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const [dailyType, setDailyType] = useState<FrequencyType>('every');

  const { day } = parseCronExpression(cronExpression);

  const handleDayChange = (value: string) => {
    updateCronExpression({ atomic: { day: value } });
  };

  const dayValue = day?.includes('*')
    ? Number(day?.replace('*', '').replace('/', ''))
    : (Number(day) ?? undefined);
  return (
    <div className="flex flex-col gap-y-2">
      <Radio.Group
        value={dailyType}
        onChange={(e) => {
          setDailyType(e.target.value as FrequencyType);

          if (e.target.value === 'every') {
            handleDayChange('*');
          }
        }}
      >
        <Radio value="every">Every number of days</Radio>
        <Radio value="at">On a specific day of the month</Radio>
      </Radio.Group>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="day">Day Interval</label>
        <InputNumber
          id="day"
          min={1}
          max={31}
          value={dayValue}
          onChange={(val) => {
            const value =
              dailyType === 'every' ? `*/${val || 1}` : (val || 1).toString();
            handleDayChange(value);
          }}
        />
      </div>
    </div>
  );
};
