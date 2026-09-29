import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, Radio } from 'antd';
import { useState } from 'react';
import { FrequencyType } from './types';

export const Hourly = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const { hour, minute } = parseCronExpression(cronExpression);

  const [hourlyType, setHourlyType] = useState<FrequencyType>(
    hour?.includes('*/') ? 'every' : 'at',
  );

  const handleMinuteChange = (value: number | null) => {
    updateCronExpression({ atomic: { minute: value?.toString() ?? '*' } });
  };
  const handleHourChange = (
    value: string,
    type: FrequencyType = hourlyType,
  ) => {
    const hourlyPrefix = type === 'every' ? '*/' : '';
    const updateHourly = `${hourlyPrefix}${value.replace('*/', '')}`;
    const everyDay = '*/1';
    updateCronExpression({ atomic: { hour: updateHourly, day: everyDay } });
  };

  const hourValue = hour?.includes('*')
    ? Number(hour?.replaceAll('*', '').replaceAll('/', ''))
    : (Number(hour) ?? undefined);
  const minuteValue = minute?.includes('*')
    ? Number(minute?.replaceAll('*', '').replaceAll('/', ''))
    : (Number(minute) ?? undefined);

  return (
    <div className="flex flex-col gap-y-2">
      <Radio.Group
        value={hourlyType}
        onChange={(e) => {
          const nextType = e.target.value as FrequencyType;
          setHourlyType(nextType);
          handleHourChange(hour ?? '1', nextType);
        }}
      >
        <Radio value="every">Every hour and minute</Radio>
        <Radio value="at">At specific hour and minute</Radio>
      </Radio.Group>

      <div className="flex items-center align-middle gap-x-3">
        <InputNumber
          min={1}
          max={23}
          value={hourValue}
          onChange={(val) => {
            handleHourChange((val ?? 1).toString());
          }}
          placeholder="Hours"
        />
        <span>{hourlyType === 'every' ? 'hour(s)' : 'hour'} at minute</span>
        <InputNumber
          min={0}
          max={59}
          value={minuteValue}
          onChange={(value) => {
            handleMinuteChange(Number(value) ?? 0);
          }}
          placeholder="Minute"
        />
      </div>
    </div>
  );
};
