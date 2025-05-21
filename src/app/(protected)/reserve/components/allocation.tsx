import React from 'react';
import { StatCard } from '@/app/(protected)/reserve/components/stat-card';
import { AllocationHistory } from './allocation-history';

export const VaultAllocation: React.FC = () => {
  return (
    <div className="w-full mt-6 max-md:max-w-full flex flex-col gap-6">
      <div className="flex w-full items-stretch gap-[18px] flex-wrap max-md:max-w-full">
        <StatCard title="Allocator Address" value="0xD4C8...2446" icon="/images/tokens/usdt.png" />
        <StatCard title="Allocator Address" value="0xD4C8...2446" icon="/images/tokens/usdt.png" />
        <StatCard
          title="Allocator Address"
          value={
            <>
              0xD4C8...2446
              <div className="bg-[rgba(68,68,71,1)] text-xs text-white px-2 py-0.5 rounded-xl mt-1">
                Public Allocator
              </div>
            </>
          }
          icon="/images/tokens/usdt.png"
        />
      </div>
      {/* Rest of allocation history implementation */}
      <AllocationHistory />
    </div>
  );
};
