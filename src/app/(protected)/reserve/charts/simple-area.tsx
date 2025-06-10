import React, { useState, useCallback, useRef } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
  AreaChart,
  Label,
  TooltipProps,
  CartesianGrid,
} from 'recharts';
import { AxisInterval } from 'recharts/types/util/types';

interface ChartProps {
  data: Array<{ date: string; value: number; tooltipDate?: string }>;
  tooltipFormatter?: (value: number) => React.ReactNode;
  className?: string;
  showAvg?: boolean;
  avgValue?: number;
  period?: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  tooltipDate?: string;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  payload?: { payload: ChartDataPoint; value: number }[];
};
export const SimpleAreaChart: React.FC<ChartProps> = ({
  data,
  tooltipFormatter,
  className,
  showAvg = true,
  avgValue = 0,
  period = '24_hours',
}) => {
  // State to track if avg line is being hovered
  const [isAvgLineHovered, setIsAvgLineHovered] = useState(false);
  // State to track if mouse is over chart
  const [isMouseOverChart, setIsMouseOverChart] = useState(false);

  // Reference to container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom event handlers for hovering on the average line
  const handleAvgLineMouseEnter = useCallback(() => {
    setIsAvgLineHovered(true);
    // Prevent event bubbling to avoid tooltip conflicts
    if (window.event) {
      window.event.stopPropagation();
    }
  }, []);

  const handleAvgLineMouseLeave = useCallback(() => {
    setIsAvgLineHovered(false);
  }, []);

  // Custom tooltip that doesn't show when hovering on average line or mouse outside chart
  const CustomTooltip = useCallback(
    (props: CustomTooltipProps) => {
      const { active, payload, label } = props;

      if (!active || isAvgLineHovered || !payload || payload.length === 0 || !isMouseOverChart)
        return null;

      return (
        <div className="custom-tooltip bg-[#22232A] p-2 rounded-md text-white text-sm border-none">
          <p className="label">{`Date: ${payload[0]?.payload?.tooltipDate || label}`}</p>
          <p className="value">
            {tooltipFormatter
              ? tooltipFormatter(payload[0]?.value || 0)
              : `${payload[0]?.value || 0}`}
          </p>
        </div>
      );
    },
    [tooltipFormatter, isAvgLineHovered, isMouseOverChart]
  );

  // Track mouse enter/leave on chart container
  const handleMouseEnter = useCallback(() => {
    setIsMouseOverChart(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOverChart(false);
  }, []);

  // Add console logs to debug
  console.log('SimpleAreaChart props:', { data: data?.length, showAvg, avgValue, period });

  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-400">
        No data available
      </div>
    );
  }

  // Calculate min and max values for better positioning
  const minValue = Math.min(...data.map(item => item.value));
  const maxValue = Math.max(...data.map(item => item.value));

  // Calculate a better position for the average label
  const yRange = maxValue - minValue;

  console.log('Chart value range:', { minValue, maxValue, yRange, avgValue });

  // Extract unique date labels for ticks
  const uniqueDates = Array.from(new Set(data.map(item => item.date).filter(Boolean)));

  // Determine appropriate interval based on period and data length
  let tickInterval: AxisInterval = 'preserveStart';
  if (period === '24_hours' && uniqueDates.length > 8) {
    tickInterval = Math.ceil(uniqueDates.length / 9) as AxisInterval; // Show ~8 ticks for 24 hour view
  }

  // Check if we should show the average line
  const shouldShowAvgLine = showAvg && data.length >= 3 && avgValue > 0;
  console.log('Should show avg line:', shouldShowAvgLine);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className || ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ left: 0, right: 0, top: 24, bottom: 0 }}
          onMouseMove={e => {
            // This prevents default tooltip behavior when avg line is hovered
            if (isAvgLineHovered && e?.isTooltipActive) {
              e.isTooltipActive = false;
            }
          }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F6DE9" stopOpacity={isAvgLineHovered ? 0.1 : 0.3} />
              <stop offset="100%" stopColor="#1F6DE9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="avgLineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3E73C4" stopOpacity={1} />
              <stop offset="100%" stopColor="#3E73C4" stopOpacity={1} />
            </linearGradient>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Lưới tham chiếu */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#333"
            opacity={0.2}
            horizontal={true}
            vertical={true}
          />

          <XAxis
            dataKey="date"
            tick={{ fill: '#A1A1AA', fontSize: 12 }}
            axisLine={true}
            tickLine={true}
            interval={tickInterval} // Dynamic interval based on period
            minTickGap={15} // Increased from 10 to 30 for better spacing
            height={50}
            ticks={uniqueDates}
            angle={-10} // Slight angle for 24-hour labels
          />
          <YAxis
            orientation="left"
            tick={{ fill: '#A1A1AA', fontSize: 10 }}
            axisLine={true}
            tickLine={true}
            tickFormatter={(value: number) => `${value}`}
            domain={[0, 'auto']} // Start from 0 and auto calculate max
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperClassName="rounded-lg overflow-hidden"
            active={isMouseOverChart && !isAvgLineHovered}
            cursor={{
              stroke: '#ffffff',
              strokeWidth: 2,
              strokeOpacity: 0.7,
              strokeDasharray: '5 5',
            }}
          />

          {/* Main data area and line */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={isAvgLineHovered ? 'rgba(31, 109, 233, 0.4)' : '#1F6DE9'}
            fill="url(#areaGradient)"
            strokeWidth={isAvgLineHovered ? 2 : 4}
            activeDot={{
              r: 6,
              fill: '#4A89E8',
              stroke: '#ffffff',
              strokeWidth: 2,
              onMouseEnter: () => console.log('Dot hovered'),
            }}
          />

          {/* Invisible wider reference line to make it easier to hover - acts as a hit area */}
          {shouldShowAvgLine && (
            <ReferenceLine
              y={avgValue}
              stroke="transparent"
              strokeWidth={20}
              ifOverflow="extendDomain"
              onMouseEnter={handleAvgLineMouseEnter}
              onMouseLeave={handleAvgLineMouseLeave}
              style={{ cursor: 'pointer' }}
            />
          )}

          {/* Visible average line with hover effect */}
          {shouldShowAvgLine && (
            <ReferenceLine
              y={avgValue}
              stroke={isAvgLineHovered ? '#4A89E8' : '#3E73C4'}
              strokeWidth={isAvgLineHovered ? 2.5 : 2}
              strokeDasharray={isAvgLineHovered ? 'none' : '3 3'}
              strokeOpacity={isAvgLineHovered ? 1 : 0.8}
              ifOverflow="extendDomain"
              style={{ pointerEvents: 'none' }} // This lets the wider invisible line handle the events
            >
              <Label
                value={
                  tooltipFormatter
                    ? `Avg ${tooltipFormatter(avgValue)}`
                    : `Avg ${avgValue.toFixed(2)}`
                }
                position="insideLeft"
                fill={isAvgLineHovered ? '#FFFFFF' : '#A1A1AA'}
                fontSize={11}
                fontWeight={isAvgLineHovered ? '600' : '500'}
                offset={30}
                style={{
                  transform: 'translateY(-20px)',
                  paddingLeft: 10,
                  backgroundColor: 'red',
                }}
              />
            </ReferenceLine>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
