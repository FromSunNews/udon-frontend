import React from 'react';
import { Typography } from '@/components/common/typography';
import { StatCard } from '@/app/(protected)/reserve/components/stat-card';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/common/button';

export const VaultHeader: React.FC = () => {
  return (
    <div className="w-full">
      <div className="fcol gap-3">
        <Button
          variant="secondary"
          className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </Button>
        <Typography variant="h1" weight="medium" className="text-3xl md:text-7xl lg:text-13xl">
          Capital <span className="text-submerged">Usual USDC</span>
        </Typography>
      </div>

      <Typography className="mt-3 text-muted-foreground">
        The Capital Usual USDC provides a set of liquid collateral markets with an optimized
        risk-adjusted return through an active rebalancing strategy.
      </Typography>

      <div className="flex w-full flex-wrap gap-3 mt-6">
        <StatCard
          title="Total Deposits (USDC)"
          value={
            <>
              <span className="font-medium">197.45</span>
              <span className="text-muted-foreground">M</span>
            </>
          }
          icon="/images/tokens/usdt.png"
          className="bg-card border-border"
        />
        <StatCard
          title="Liquidity (USDC)"
          value={
            <>
              <span className="font-medium">197.45</span>
              <span className="text-muted-foreground">M</span>
            </>
          }
          icon="/images/tokens/usdt.png"
          className="bg-card border-border"
        />
        <StatCard
          title="Disclosures"
          value={
            <>
              <span className="font-medium">197.45</span>
              <span className="text-muted-foreground">M</span>
            </>
          }
          icon="/images/tokens/usdt.png"
          className="bg-card border-border"
        />
        <StatCard
          title="APY"
          value={
            <>
              <span className="font-medium">7.07</span>
              <span className="text-muted-foreground">%</span>
            </>
          }
          icon="/images/tokens/usdt.png"
          className="bg-card border-border"
        />
      </div>
    </div>
  );
};
