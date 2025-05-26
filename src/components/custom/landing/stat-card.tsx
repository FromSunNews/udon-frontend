import CountUp from '@/components/common/count-up';
import { Skeleton } from '@/components/common/skeleton';
import { Typography } from '@/components/common/typography';
import React from 'react';

interface StatCardProps {
  value: number;
  label: string;
  iconUrl: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, iconUrl, isLoading }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.71)] border self-stretch flex min-w-60 overflow-hidden flex-col items-stretch flex- spac[-8px]-y-6 shrink basis-[0%] p-6 rounded-3xl border-[rgba(138,183,246,1)] border-solid backdrop-blur-md">
      {/* Top Glow Effect */}
      <div className="absolute w-3/4 left-1/2 -translate-x-1/2 h-[20px] top-0  bg-[#8ab7f6] blur-[42px] rounded-full z-0" />

      {/* Value and Label */}
      <div className="flex flex-row justify-between">
        <div className="w-full text-neutral-800 font-normal">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-36 mb-2 bg-black/10" />
              <Skeleton className="h-5 w-24 bg-black/10" />
            </>
          ) : (
            <>
              <CountUp value={value} prefix="$" className="text-[40px]" />
              <Typography variant="h5" color="submerged" className="text-2xl mt-1.5">
                {label}
              </Typography>
            </>
          )}
        </div>
        <div className="w-[100px] h-[100px] relative">
          {isLoading ? (
            <Skeleton className="w-[100px] h-[100px] rounded-full bg-black/10" />
          ) : (
            <video
              src={iconUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
};
