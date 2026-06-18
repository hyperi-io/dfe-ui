'use client';

import {
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipIndex,
} from 'recharts';

const data = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
  { name: 'B4', value: 30 },
  { name: 'B5', value: 50 },
  { name: 'C1', value: 100 },
  { name: 'C2', value: 200 },
  { name: 'D1', value: 150 },
  { name: 'D2', value: 50 },
];

// #endregion

/** Named to avoid accidental `import { PieChart } from 'recharts'` in parents. */
export const SpendPieChart = ({
  isAnimationActive,
  defaultIndex,
}: {
  isAnimationActive?: boolean;
  defaultIndex?: TooltipIndex;
}) => {
  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius="100%"
            fill="#8884d8"
            isAnimationActive={isAnimationActive}
          />

          <Tooltip defaultIndex={defaultIndex} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
