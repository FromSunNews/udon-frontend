'use client';

import Image from 'next/image';
import React from 'react';
import { Typography } from '@/components/common/typography';

interface StatCardProps {
  value: string;
  label: string;
  iconUrl: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, iconUrl }) => {
  return (
    <div className="rounded-[18px] p-[1px] bg-gradient-to-b from-[#197A94] from-74% to-[#293564] to-0% overflow-hidden flex-1">
      <div className="rounded-[calc(18px-1px)] bg-[#181E26] h-full mt-[1px]">
        <div className="p-[18px] flex items-center gap-5 [background:radial-gradient(80%_80%_at_50%_100%,rgba(82,179,239,0.4)_0%,rgba(74,163,201,0)_85%)]">
          <div className="flex-1">
            <Typography variant="h3" weight="semibold" className="text-[32px]">
              {value}
            </Typography>
            <Typography variant="h5" color="submerged">
              {label}
            </Typography>
          </div>
          <div className="w-[99px] h-[99px] relative">
            <Image src={iconUrl} fill alt={`${label} icon`} />
          </div>
        </div>
      </div>
    </div>
  );
};
