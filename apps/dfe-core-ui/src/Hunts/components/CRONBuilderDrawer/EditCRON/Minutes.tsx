import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { InputNumber } from 'antd';

export const Minutes = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const { minute } = parseCronExpression(cronExpression);

  const handleChange = (value: number | undefined) => {
    if (!value) {
      updateCronExpression({ atomic: { minute: '*' } });
      return;
    }
    updateCronExpression({ atomic: { minute: `*/${value.toString()}` } });
  };

  const value = minute?.includes('*')
    ? Number(minute?.replaceAll('*', '').replaceAll('/', ''))
    : (Number(minute) ?? undefined);

  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="minutes">Every minute</label>
      <InputNumber
        id="minutes"
        className="w-full"
        min={1}
        max={59}
        value={value}
        onChange={(val) => {
          handleChange(Number(val) ?? undefined);
        }}
      />
    </div>
  );
};
