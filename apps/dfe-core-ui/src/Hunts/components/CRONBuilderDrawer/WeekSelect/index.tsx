import { cn } from '@/core/utils/style';
import { WEEKDAYS } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.constants';
import { Button } from 'antd';

const WEEKDAY_VALUES = new Set<string>(WEEKDAYS.map((day) => day.value));

const selectedWeekdays = (value: string) =>
  new Set(
    value
      .split(',')
      .map((day) => day.trim())
      .filter((day) => WEEKDAY_VALUES.has(day)),
  );

const toWeekValue = (days: Set<string>) => {
  const selected = WEEKDAYS.filter((day) => days.has(day.value)).map(
    (day) => day.value,
  );
  return selected.join(',') || '*';
};

export const WeekSelect = ({
  id,
  onChange,
  value,
}: {
  id: string;
  onChange: (value: string) => void;
  value: string;
}) => {
  const selectedDays = selectedWeekdays(value ?? '');

  const handleSpecificDayChange = (day: string) => {
    const next = new Set(selectedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    onChange(toWeekValue(next));
  };

  return (
    <div role="group" className="grid grid-cols-7 gap-x-2">
      {WEEKDAYS.map((day) => {
        const isSelected = selectedDays.has(day.value);
        return (
          <Button
            role="option"
            aria-selected={isSelected}
            aria-labelledby={id}
            htmlType="button"
            type="default"
            key={day.value}
            className={cn(
              isSelected && 'border border-tertiary! text-tertiary!',
            )}
            onClick={() => {
              handleSpecificDayChange(day.value);
            }}
          >
            {day.label.slice(0, 3)}
          </Button>
        );
      })}
    </div>
  );
};
