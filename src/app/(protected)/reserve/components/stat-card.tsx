import { cn } from '@/utils/tailwind';
import { Typography } from '@/components/common/typography';
import React from 'react';
import Image from 'next/image';
import CountUp from '@/components/common/count-up';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon?: string;
  className?: string;
  background?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  // icon,
  className,
  background,
  suffix,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-row justify-between flex-1 p-4 rounded-lg border bg-card min-w-[150px] sm:min-w-[200px]',
        className
      )}
    >
      {background && (
        <div className="absolute h-full w-full inset-0 rounded-lg">
          <Image src={background} className="object-cover" alt="" fill />
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <CountUp
            value={value}
            suffix={suffix || ''}
            decimals={2}
            className="font-medium text-2xl"
          />
        </div>
        <Typography className="text-muted-foreground mt-1">{title}</Typography>
      </div>
      {/* {icon && (
        <div className="relative w-6 h-6">
          <Image src={icon} alt="" fill className="object-contain" />
        </div>
      )} */}
    </div>
  );
};
