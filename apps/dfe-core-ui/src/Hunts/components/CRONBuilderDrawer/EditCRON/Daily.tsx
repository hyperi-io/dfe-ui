import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, InputProps, Radio } from 'antd';
import { useState } from 'react';
import { FrequencyType } from './types';

export const Daily = ({ onChange: _onChange, ..._props }: InputProps) => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const [dailyType, setDailyType] = useState<FrequencyType>('every');

  const { hour, minute, day } = parseCronExpression(cronExpression);

  const handleHourChange = (value: number | null) => {
    updateCronExpression({ atomic: { hour: value?.toString() ?? '*' } });
  };

  const handleMinuteChange = (value: number | null) => {
    updateCronExpression({ atomic: { minute: value?.toString() ?? '*' } });
  };

  const handleDayChange = (value: string) => {
    updateCronExpression({ atomic: { day: value } });
  };

  const hourValue = hour?.includes('*')
    ? Number(hour?.replace('*', '').replace('/', ''))
    : (Number(hour) ?? undefined);
  const minuteValue = minute?.includes('*')
    ? Number(minute?.replace('*', '').replace('/', ''))
    : (Number(minute) ?? undefined);
  const dayValue = day?.includes('*')
    ? Number(day?.replace('*', '').replace('/', ''))
    : (Number(day) ?? undefined);
  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="start_time">Start Time</label>
      <div className="flex items-center gap-x-1">
        <InputNumber
          id="start_time"
          min={0}
          max={23}
          value={hourValue}
          onChange={(val) => {
            handleHourChange(val ?? 0);
          }}
          style={{ width: 100 }}
          placeholder="Hour"
        />
        <span>:</span>
        <InputNumber
          min={0}
          max={59}
          value={minuteValue}
          onChange={(val) => {
            handleMinuteChange(val ?? 0);
          }}
          style={{ width: 100 }}
          placeholder="Minute"
        />
      </div>

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
