import React from 'react';

interface AllocationChartProps {
  percentage: number;
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({
  percentage,
  size = 32,
  primaryColor = 'hsl(var(--primary))',
  secondaryColor = '#282A2E',
}) => {
  const strokeWidth = 4;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="font-semibold text-white text-base">{percentage.toFixed(2)}%</span>
    </div>
  );
};
