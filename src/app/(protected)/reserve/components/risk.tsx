import React from 'react';
import { StatCard } from '@/app/(protected)/reserve/components/stat-card';

export const VaultRisk: React.FC = () => {
  return (
    <div className="w-full mt-6 max-md:max-w-full">
      <div className="flex w-full items-center gap-[18px] flex-wrap max-md:max-w-full">
        <StatCard title="Risk Rating" value={2} />
        <StatCard title="Curator TVL" value={244450000} />
        <StatCard title="Vault Deployment Date" value={24072024} />
      </div>
      <div className="flex w-full items-stretch gap-4 flex-wrap mt-4 max-md:max-w-full">
        <StatCard title="Owner" value={12} icon="/images/tokens/usdt.png" />
        <StatCard title="Curator Address" value={12} icon="/images/tokens/usdt.png" />
        <StatCard title="Timelock / Guardian" value={12} icon="/images/tokens/usdt.png" />
      </div>
    </div>
  );
};
