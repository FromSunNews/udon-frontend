'use client';

import Image from 'next/image';
import React from 'react';
import { Typography } from '@/components/common/typography';
import CountUp from '@/components/common/count-up';
import { Skeleton } from '@/components/common/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/utils/tailwind';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';

interface StatItemProps {
  value: number;
  label: string;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  tooltip?: string;
}

interface StatCardProps {
  value: number;
  label: string;
  iconUrl?: string;
  isLoading?: boolean;
  videoUrl?: string;
  tooltip?: string;
}

interface MultiStatCardProps {
  items: StatItemProps[];
  className?: string;
}

interface CombinedStatsCardProps {
  depositValue: number;
  borrowValue: number;
  isLoading?: boolean;
  className?: string;
  depositTooltip?: string;
  borrowTooltip?: string;
}

// Component for a single stat item (value + label)
const StatItem: React.FC<StatItemProps> = ({
  value,
  label,
  isLoading = false,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  tooltip = '',
}) => (
  <div className={`flex flex-col items-center justify-center`}>
    {isLoading ? (
      <>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-5 w-20" />
      </>
    ) : (
      <>
        {value === -1 ? (
          <Typography className="!text-green-500 text-[24px] sm:text-[32px] text-bold">
            ∞
          </Typography>
        ) : value === 0 ? (
          <Typography className="font-medium text-[24px] sm:text-[32px]">_</Typography>
        ) : (
          <CountUp
            value={value}
            prefix={prefix}
            suffix={suffix}
            className={cn('text-[24px] sm:text-[32px] font-medium', className)}
            decimals={decimals}
          />
        )}
        <div className="flex items-center gap-1.5">
          <Typography color="submerged" className="font-normal text-lg">
            {label}
          </Typography>

          {tooltip && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-submerged cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </>
    )}
  </div>
);

// Card with multiple stats in columns (Net worth, Net APY, Health factor)
export const MultiStatCard: React.FC<MultiStatCardProps> = ({ items, className = '' }) => {
  return (
    <div
      className={`rounded-2xl p-[1px] bg-gradient-to-b from-[#3E73C4] from-74% to-[#293564] to-0% overflow-hidden w-full ${className}`}
    >
      <div className="rounded-2xl bg-[#181E26] h-full mt-[1px]">
        <div className="px-0 sm:px-4 py-6 grid grid-cols-3 items-center justify-center text-center gap-4 [background:radial-gradient(80%_80%_at_50%_100%,rgba(82,179,239,0.4)_0%,rgba(74,163,201,0)_85%)] h-full">
          {items.map((item, index) => (
            <StatItem
              key={index}
              value={item.value}
              label={item.label}
              isLoading={item.isLoading}
              prefix={item.prefix}
              suffix={item.suffix}
              decimals={item.decimals}
              className={item.className}
              tooltip={item.tooltip}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Combined card showing both deposit and borrow stats with icons
export const CombinedStatsCard: React.FC<CombinedStatsCardProps> = ({
  depositValue,
  borrowValue,
  isLoading = false,
  className = '',
  depositTooltip = '',
  borrowTooltip = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      className={`rounded-2xl p-[1px] bg-gradient-to-b from-[#3E73C4] from-74% to-[#293564] to-0% overflow-hidden w-full ${className}`}
    >
      <div className="rounded-2xl bg-[#181E26] h-full mt-[1px]">
        <div className="px-4 sm:px-4 py-6 grid grid-cols-2 items-center justify-center text-center gap-4 [background:radial-gradient(80%_80%_at_50%_100%,rgba(82,179,239,0.4)_0%,rgba(74,163,201,0)_85%)] h-full">
          {/* Borrow section */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <CountUp
                    value={depositValue}
                    prefix="$"
                    className="text-[24px] sm:text-[32px] font-medium"
                  />
                  <div className="flex items-center gap-1.5">
                    <Typography color="submerged" className="font-normal text-lg">
                      Total Deposit
                    </Typography>

                    {depositTooltip && (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-submerged cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                            <p>{depositTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-[50px] sm:w-[80px] h-[50px] sm:h-[80px] relative">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : (
                <Image
                  src={
                    isMobile ? '/images/supply/saving-piggy.svg' : '/images/supply/saving-piggy.gif'
                  }
                  fill
                  alt="Borrows icon"
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Deposit section */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <CountUp
                    value={borrowValue}
                    prefix="$"
                    className="text-[24px] sm:text-[32px] font-medium"
                  />
                  <div className="flex items-center gap-1.5">
                    <Typography color="submerged" className="font-normal text-lg">
                      Total Borrows
                    </Typography>

                    {borrowTooltip && (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-submerged cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                            <p>{borrowTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-[50px] sm:w-[80px] h-[50px] sm:h-[80px] relative">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : (
                <Image
                  src={isMobile ? '/images/supply/coin-stack.svg' : '/images/supply/coin-stack.gif'}
                  fill
                  alt="Deposit icon"
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card with a single stat and icon (Deposit, Borrow)
export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  iconUrl = '',
  isLoading = false,
  videoUrl = '',
  tooltip = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#3E73C4] from-74% to-[#293564] to-0% overflow-hidden flex-1">
      <div className="rounded-2xl bg-[#181E26] h-full mt-[1px]">
        <div className="sm:px-6 px-4 sm:py-6 py-3 flex items-center justify-between gap-5 [background:radial-gradient(80%_80%_at_50%_100%,rgba(82,179,239,0.4)_0%,rgba(74,163,201,0)_85%)]">
          <div>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-5 w-24" />
              </>
            ) : (
              <>
                <CountUp
                  value={value}
                  prefix="$"
                  className="text-[24px] sm:text-[32px] font-medium"
                />
                <div className="flex items-center gap-1.5">
                  <Typography color="submerged" className="font-normal">
                    {label}
                  </Typography>

                  {tooltip && (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-submerged cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[250px] text-sm">
                          <p>{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="w-[60px] sm:w-[80px] h-[60px] sm:h-[80px] relative">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (
              <Image
                src={isMobile ? iconUrl : videoUrl || iconUrl}
                fill
                alt={`${label} icon`}
                className="object-contain"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
