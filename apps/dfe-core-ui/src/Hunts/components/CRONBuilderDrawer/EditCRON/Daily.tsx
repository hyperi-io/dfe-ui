import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, InputProps } from 'antd';

export const Daily = ({ onChange: _onChange, ..._props }: InputProps) => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();

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

      <label htmlFor="day_interval">Day </label>
      <InputNumber
        id="day_interval"
        min={1}
        max={31}
        value={dayValue}
        onChange={(val) => {
          handleDayChange((val || 1).toString());
        }}
      />
    </div>
  );
};
