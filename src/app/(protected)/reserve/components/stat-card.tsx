import { cn } from '@/utils/tailwind';
import { Typography } from '@/components/common/typography';
import React from 'react';
import Image from 'next/image';

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  icon?: string;
  className?: string;
  background?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  className,
  background,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-row justify-between flex-1 p-4 rounded-lg border bg-card',
        className
      )}
    >
      {background && (
        <div className="absolute h-full w-full inset-0 rounded-lg">
          <Image src={background} className="object-cover" alt="" fill />
        </div>
      )}
      <div className="flex flex-col">
        <div className="text-2xl font-medium">{value}</div>
        <Typography size="sm" className="text-muted-foreground mt-1">
          {title}
        </Typography>
      </div>
      {icon && (
        <div className="w-5 h-5">
          <Image src={icon} alt="" width={24} height={24} />
        </div>
      )}
    </div>
  );
};
