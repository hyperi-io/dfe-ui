import { cn } from '@/core/utils/style';
import { WEEKDAYS } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.constants';
import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { Button, InputNumber, InputProps, Radio } from 'antd';
import { useState } from 'react';

type DailyType = 'every' | 'specific';

export const Daily = ({ onChange: _onChange, ..._props }: InputProps) => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const [selectedDays, setSelectedDays] = useState<{
    0?: boolean;
    1?: boolean;
    2?: boolean;
    3?: boolean;
    4?: boolean;
    5?: boolean;
    6?: boolean;
  }>({});
  const { hour, minute, day } = parseCronExpression(cronExpression);

  const [dailyType, setDailyType] = useState<DailyType>(
    hour?.includes('*/') ? 'every' : 'specific',
  );

  const handleHourChange = (value: number | null) => {
    updateCronExpression({ atomic: { hour: value?.toString() ?? '*' } });
  };

  const handleMinuteChange = (value: number | null) => {
    updateCronExpression({ atomic: { minute: value?.toString() ?? '*' } });
  };

  const handleDayChange = (value: string) => {
    updateCronExpression({ atomic: { day: value } });
  };

  const handleSpecificDayChange = (value: keyof typeof selectedDays) => {
    const newSelectedDays = { ...selectedDays, [value]: !selectedDays[value]! };
    setSelectedDays(newSelectedDays);
    const dayString = Object.entries(newSelectedDays)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(',');
    handleDayChange(dayString);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="start_time">Start Time</label>
      <div className="flex items-center gap-x-1">
        <InputNumber
          id="start_time"
          min={0}
          max={23}
          value={Number(hour?.replace('*/', '')) ?? 0}
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
          value={Number(minute?.replace('*/', '')) ?? 0}
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
          setDailyType(e.target.value);
          if (e.target.value === 'weekday') {
            updateCronExpression({ atomic: { day: '* * * * 1-5' } });
          }
        }}
      >
        <Radio value="every">Every number of days</Radio>
        <Radio value="specific">On specific days</Radio>
      </Radio.Group>
      {dailyType === 'every' && (
        <InputNumber
          min={1}
          max={31}
          value={Number(day?.replace('*/', '')) ?? 1}
          onChange={(val) => {
            handleDayChange((val || 1).toString());
          }}
        />
      )}
      {dailyType === 'specific' && (
        <div className="grid grid-cols-7 gap-x-2">
          {WEEKDAYS.map((day) => (
            <Button
              htmlType="button"
              type="default"
              key={day.value}
              className={cn(
                selectedDays[day.value as keyof typeof selectedDays] &&
                  'border border-tertiary! text-tertiary!',
              )}
              onClick={() => {
                handleSpecificDayChange(day.value as keyof typeof selectedDays);
              }}
            >
              {day.label.slice(0, 3)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
