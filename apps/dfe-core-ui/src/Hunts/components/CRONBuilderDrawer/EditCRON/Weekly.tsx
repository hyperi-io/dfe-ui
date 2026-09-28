import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { parseCronExpression } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.helpers';
import { WeekSelect } from '@/Hunts/components/CRONBuilderDrawer/WeekSelect';
import { InputProps } from 'antd';

export const Weekly = ({ onChange: _onChange, ..._props }: InputProps) => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  const { week } = parseCronExpression(cronExpression);

  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor="week">Days of the week</label>
      <WeekSelect
        id="week"
        value={week ?? ''}
        onChange={(value) => {
          updateCronExpression({ atomic: { week: value } });
        }}
      />
    </div>
  );
};
