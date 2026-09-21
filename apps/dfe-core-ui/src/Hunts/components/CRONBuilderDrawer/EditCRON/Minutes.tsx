import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber } from 'antd';

export const Minutes = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();

  const { minute } = parseCronExpression(cronExpression);

  const handleChange = (val: number) => {
    updateCronExpression({ atomic: { minute: val.toString() } });
  };
  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="minutes">Every minute</label>
      <InputNumber
        id="minutes"
        className="w-full"
        min={1}
        max={59}
        value={Number(minute) ?? 1}
        onChange={(val) => {
          handleChange(Number(val) ?? 1);
        }}
      />
    </div>
  );
};
