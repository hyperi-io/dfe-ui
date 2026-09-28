import { cn } from '@/core/utils/style';
import { WEEKDAYS } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.constants';
import { Button } from 'antd';
import { useState } from 'react';

type WeekdayKey = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
export const WeekSelect = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const [selectedDays, setSelectedDays] = useState<Record<WeekdayKey, boolean>>(
    value
      ?.split(',')
      ?.reduce(
        (acc, day) => ({ ...acc, [day as WeekdayKey]: true }),
        {} as Record<WeekdayKey, boolean>,
      ) ?? {},
  );

  const handleSpecificDayChange = (day: WeekdayKey) => {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day]! }));
    onChange(
      Object.entries(selectedDays)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(','),
    );
  };

  return (
    <div className="grid grid-cols-7 gap-x-2">
      {WEEKDAYS.map((day) => (
        <Button
          htmlType="button"
          type="default"
          key={day.value}
          className={cn(
            selectedDays[day.value as unknown as WeekdayKey] &&
              'border border-tertiary! text-tertiary!',
          )}
          onClick={() => {
            handleSpecificDayChange(day.value as unknown as WeekdayKey);
          }}
        >
          {day.label.slice(0, 3)}
        </Button>
      ))}
    </div>
  );
};
