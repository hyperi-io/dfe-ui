import { useCRONBuilderContext } from '@/Hunts/components/CRONBuilderDrawer/CRONBuilder.context';
import { Input } from 'antd';

export const Custom = () => {
  const { cronExpression, updateCronExpression } = useCRONBuilderContext();
  return (
    <Input
      value={cronExpression}
      onChange={(e) =>
        updateCronExpression({
          raw: e.target.value as string,
        })
      }
    />
  );
};
