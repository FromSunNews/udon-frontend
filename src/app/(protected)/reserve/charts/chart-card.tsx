import CountUp from '@/components/common/count-up';
import { cn } from '@/utils/tailwind';
import React from 'react';

interface ChartCardProps {
  title: string;
  value: number;
  suffix?: string;
  children: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  children,
  filters,
  className,
  suffix,
}) => {
  return (
    <div className={cn('bg-card border rounded-2xl p-5 md:p-6', className)}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-lg mb-1">{title}</div>
          <CountUp value={value} suffix={suffix || ''} className="text-3xl font-semibold" />
        </div>
        <div className="flex gap-2 flex-wrap">{filters}</div>
      </div>
      <div className="mt-6 h-52 w-full">{children}</div>
    </div>
  );
};
