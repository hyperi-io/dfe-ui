'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const rangeData = [
  { day: '05-01', temperature: [-1, 10] },
  { day: '05-02', temperature: [2, 15] },
  { day: '05-03', temperature: [3, 12] },
  { day: '05-04', temperature: [4, 12] },
  { day: '05-05', temperature: [12, 16] },
  { day: '05-06', temperature: [5, 16] },
  { day: '05-07', temperature: [3, 12] },
  { day: '05-08', temperature: [0, 8] },
  { day: '05-09', temperature: [-3, 5] },
];

export const SpendRangeChart = ({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) => (
  <div className="h-[280px] w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rangeData}>
        <XAxis dataKey="day" />
        <YAxis width="auto" />
        <Area
          dataKey="temperature"
          stroke="#8884d8"
          fill="#8884d8"
          isAnimationActive={isAnimationActive}
        />
        <Tooltip />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
