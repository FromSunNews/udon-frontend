'use client';

import Image from 'next/image';
import React from 'react';
import { Typography } from '@/components/common/typography';
import CountUp from '@/components/common/count-up';
import { Skeleton } from '@/components/common/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';

interface StatCardProps {
  value: number;
  label: string;
  iconUrl?: string;
  isLoading?: boolean;
  videoUrl?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  iconUrl = '',
  isLoading = false,
  videoUrl = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-b from-[#3E73C4] from-74% to-[#293564] to-0% overflow-hidden flex-1">
      <div className="rounded-2xl bg-[#181E26] h-full mt-[1px]">
        <div className="sm:px-4 px-4 sm:py-4 py-2 flex items-center gap-5 [background:radial-gradient(80%_80%_at_50%_100%,rgba(82,179,239,0.4)_0%,rgba(74,163,201,0)_85%)]">
          <div className="flex-1">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-36 mb-2" />
                <Skeleton className="h-5 w-24" />
              </>
            ) : (
              <>
                <CountUp value={value} prefix="$" className="text-[32px]" />
                <Typography
                  variant="h5"
                  color="submerged"
                  className="sm:text-lg text-2xl font-medium"
                >
                  {label}
                </Typography>
              </>
            )}
          </div>
          <div className="w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] relative">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (
              <Image
                src={isMobile ? iconUrl : videoUrl}
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
