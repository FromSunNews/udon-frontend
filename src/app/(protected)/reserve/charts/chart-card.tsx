import { cn } from '@/utils/tailwind';
import React from 'react';

interface ChartCardProps {
  title: string;
  value: string | number;
  valueSuffix?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  valueSuffix = '',
  children,
  filters,
  className,
}) => {
  return (
    <div className={cn('bg-card border rounded-2xl p-5 md:p-6', className)}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm mb-1">{title}</div>
          <div className="text-3xl font-semibold">
            {value}
            <span className="text-3xl font-medium">{valueSuffix}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">{filters}</div>
      </div>
      <div className="mt-6 h-52 w-full">{children}</div>
    </div>
  );
};
