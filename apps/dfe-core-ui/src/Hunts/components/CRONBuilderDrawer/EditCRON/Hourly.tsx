import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber, Radio } from 'antd';
import { useState } from 'react';

export const Hourly = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const { hour, minute } = parseCronExpression(cronExpression);

  const [hourlyType, setHourlyType] = useState<'every' | 'at'>(
    hour?.includes('*/') ? 'every' : 'at',
  );

  const handleMinuteChange = (value: number | null) => {
    updateCronExpression({ atomic: { minute: value?.toString() ?? '*' } });
  };
  const handleHourChange = (value: number | null) => {
    const updateHourly =
      hourlyType === 'every'
        ? `*/${value?.toString() ?? '*'}`
        : (value?.toString() ?? '*');
    updateCronExpression({ atomic: { hour: updateHourly } });
  };
  return (
    <div className="flex flex-col gap-y-2">
      <Radio.Group
        value={hourlyType}
        onChange={(e) => {
          setHourlyType(e.target.value);
        }}
      >
        <Radio value="every">Every hour and minute</Radio>
        <Radio value="at">At specific hour and minute</Radio>
      </Radio.Group>

      <div className="flex items-center align-middle gap-x-3">
        <InputNumber
          min={1}
          max={23}
          value={Number(hour?.replace('*/', '')) ?? 1}
          onChange={(val) => {
            handleHourChange(Number(val) ?? 1);
          }}
          placeholder="Hours"
        />
        <span>hour(s) at minute</span>
        <InputNumber
          min={0}
          max={59}
          value={Number(minute?.replace('*/', '')) ?? 0}
          onChange={(value) => {
            handleMinuteChange(Number(value) ?? 0);
          }}
          placeholder="Minute"
        />
      </div>
    </div>
  );
};
