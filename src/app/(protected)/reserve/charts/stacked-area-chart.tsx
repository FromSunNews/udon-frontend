import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/utils/tailwind';

interface ChartDataItem {
  date: string;
  [key: string]: string | number;
}

interface StackedAreaChartProps {
  data: ChartDataItem[];
  className?: string;
  height?: number;
  //   showAvg?: boolean;
  //   avgValue?: number;
}

// Define colors for the chart
const COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff8042', // Orange
  '#0088fe', // Blue
  '#00c49f', // Teal
  '#ffbb28', // Gold
  '#ff5656', // Red
  '#ad6eef', // Lavender
  '#c084fc', // Purple
];

export const StackedAreaChart: React.FC<StackedAreaChartProps> = ({
  data,
  className,
  height = 400,
  //   showAvg = true,
  //   avgValue = 4.55,
}) => {
  //   const renderAvgLabel = () => {
  //     return (
  //       <g>
  //         <circle cx={70} cy={70} r={35} fill="#282828" opacity={0.8} />
  //         <text x={70} y={70} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12}>
  //           Avg {avgValue}%
  //         </text>
  //       </g>
  //     );
  //   };

  // Get all data keys except 'date'
  const keys = Object.keys(data[0] || {}).filter(key => key !== 'date');

  return (
    <div className={cn('w-full h-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            {keys.map((key, index) => (
              <linearGradient key={key} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.2} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.4} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#A1A1AA', fontSize: 12 }}
            axisLine={true}
            tickLine={true}
          />
          <YAxis
            orientation="left"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={true}
            tickLine={true}
            tickFormatter={(value: number) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E1E20',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          {keys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={COLORS[index % COLORS.length]}
              fill={`url(#color${index})`}
              fillOpacity={1}
            />
          ))}
          {/* {showAvg && renderAvgLabel()} */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
