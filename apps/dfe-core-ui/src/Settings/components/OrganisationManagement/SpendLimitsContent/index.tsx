import { SpendComposedChart } from './SpendComposedChart';
import { SpendPieChart } from './SpendPieChart';
import { SpendRangeChart } from './SpendRangeChart';

export const SpendLimitsContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3">
      <SpendRangeChart />
      <SpendPieChart />
      <SpendComposedChart />
    </div>
  );
};
