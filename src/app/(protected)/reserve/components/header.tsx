import React from 'react';
import { Typography } from '@/components/common/typography';
import { StatCard } from '@/app/(protected)/reserve/components/stat-card';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/common/button';
import { UserReserveData } from '@/app/(protected)/dashboard/types';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetLink } from '@/utils/get-tx-link';

interface VaultHeaderProps {
  reserve: UserReserveData;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({ reserve }) => {
  return (
    <div className="w-full">
      <div className="fcol gap-3">
        <Link href="/dashboard">
          <Button
            variant="secondary"
            className="w-10 h-10 p-0 rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Button>
        </Link>
        <div className="flex flex-row gap-4 items-center">
          <Image
            src={reserve.iconUrl}
            alt={reserve.symbol}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-2 items-center">
              <Typography variant="h1" weight="medium" className="text-3xl md:text-7xl lg:text-7xl">
                {reserve.symbol} <span className="text-submerged">Reserve</span>
              </Typography>
              {/* icon external link */}
              <Button
                variant="secondary"
                className="w-8 h-8 p-0 rounded-full flex items-center justify-center"
                onClick={() => {
                  window.open(getAssetLink(reserve.assetId.toString('hex')), '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            <Typography className="text-muted-foreground text-lg">
              The {reserve.symbol} reserve provides a set of liquid collateral markets with an
              optimized risk-adjusted return.
            </Typography>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-3 mt-6">
        <StatCard
          title="Total Supply"
          value={reserve.currentATokenTotalSupply}
          suffix={` ${reserve.symbol}`}
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />
        <StatCard
          title="Total Borrow"
          value={reserve.currentVariableDebtTokenTotalSupply}
          suffix={` ${reserve.symbol}`}
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />

        <StatCard
          title="Available Liquidity"
          value={reserve.availableLiquidity}
          suffix={` ${reserve.symbol}`}
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />

        <StatCard
          title="Price"
          value={reserve.price}
          suffix=" USD"
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />

        <StatCard
          title="Utilization"
          value={
            (reserve.currentVariableDebtTokenTotalSupply / reserve.currentATokenTotalSupply) * 100
          }
          suffix="%"
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />

        <StatCard
          title="Supply APY"
          value={reserve.supplyAPY}
          suffix="%"
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />

        <StatCard
          title="Borrow APY"
          value={reserve.borrowAPY}
          suffix="%"
          icon={reserve.iconUrl}
          className="bg-card border-border"
        />
      </div>
    </div>
  );
};
