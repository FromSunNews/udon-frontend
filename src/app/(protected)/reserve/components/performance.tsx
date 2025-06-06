import React from 'react';
import { StatCard } from '@/app/(protected)/reserve/components/stat-card';
import { StatCardGrid } from '@/app/(protected)/reserve/components/stat-card-grid';

export const VaultPerformance: React.FC = () => {
  return (
    <div className="w-full mt-6 max-md:max-w-full">
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="7D APY" value={6.88} className="h-full" />
        <StatCard title="30D APY" value={6.88} className="h-full" />
        <StatCard title="90D APY" value={6.88} className="h-full" />
      </div>
      <StatCardGrid
        columns={2}
        gap="gap-[18px]"
        className="mt-[18px]"
        responsiveCols="max-md:grid-cols-1"
      >
        <StatCard title="Performance Fee" value={10} className="h-full" />
        <StatCard
          title="Management Fee"
          value={10}
          icon="/images/tokens/usdt.png"
          className="h-full"
        />
      </StatCardGrid>
    </div>
  );
};
