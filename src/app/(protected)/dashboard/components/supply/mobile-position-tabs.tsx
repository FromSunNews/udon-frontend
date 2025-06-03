'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Button } from '@/components/common/button';
import { Switch } from '@/components/common/switch';
import { Typography } from '@/components/common/typography';
import { Skeleton } from '@/components/common/skeleton';
import CountUp from '@/components/common/count-up';
import { UserAccountData, UserReserveData } from '../../types';
import { useRouter } from 'next/navigation';
import { SupplyDialog } from './supply-dialog';
import { WithdrawDialog } from './withdraw-dialog';
import { CollateralDialog } from './collateral-dialog';

interface MobileSupplyPositionProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  accountData: UserAccountData;
}

export const MobileSupplyPositionTabs: React.FC<MobileSupplyPositionProps> = ({
  positions,
  isLoading,
  mutateAssets,
  accountData,
}) => {
  const router = useRouter();
  const [selectedPosition, setSelectedPosition] = React.useState<UserReserveData | null>(null);
  const [supplyDialogOpen, setSupplyDialogOpen] = React.useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = React.useState(false);
  const [collateralDialogOpen, setCollateralDialogOpen] = React.useState(false);

  // Handle supply button click for a position
  const handleSupplyClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setSupplyDialogOpen(true);
  };

  // Handle withdraw button click for a position
  const handleWithdrawClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setWithdrawDialogOpen(true);
  };

  // Handle collateral switch click
  const handleCollateralSwitch = (position: UserReserveData) => {
    setSelectedPosition(position);
    setCollateralDialogOpen(true);
  };

  // Handle asset click
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className={`flex flex-row w-full p-4 rounded-lg mb-2 ${index % 2 === 0 ? 'bg-black' : 'bg-card'}`}
          >
            {/* Left section skeleton (70%) */}
            <div className="flex flex-col w-[70%] gap-3">
              {/* Row 1 skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex flex-col">
                  <Skeleton className="w-16 h-5 mb-1" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>

              {/* Row 2 skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-10 h-5 rounded-full" />
              </div>

              {/* Row 3 skeleton */}
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-4" />
                <Skeleton className="w-12 h-4" />
              </div>
            </div>

            {/* Right section skeleton (30%) */}
            <div className="flex flex-col w-[30%] gap-2 justify-center">
              <Skeleton className="w-full h-8 rounded-md" />
              <Skeleton className="w-full h-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Typography className="text-submerged text-center">
          No supply positions found. Start supplying assets to earn interest.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-2">
      {positions.map((position, index) => (
        <div
          key={position.symbol}
          className={`flex flex-row w-full p-4 rounded-lg ${index % 2 === 0 ? 'bg-black' : 'bg-card'}`}
        >
          {/* Left section (70%) */}
          <div className="flex flex-col w-[70%] gap-3 justify-center">
            {/* Row 1: Token image, name, and price */}
            <div
              className="flex items-center gap-3"
              onClick={() => handleAssetClick(position.symbol)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={position.iconUrl} alt={position.symbol} />
                <AvatarFallback>{position.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Typography weight="medium" className="text-base">
                  {position.symbol}
                </Typography>
                <div className="flex items-center">
                  <CountUp value={Number(position.currentATokenBalance)} className="text-sm" />
                  <Typography variant="small" color="submerged" className="ml-1">
                    $
                    <CountUp
                      value={Number(position.currentATokenBalance) * (position.price || 0)}
                      className="text-xs"
                    />
                  </Typography>
                </div>
              </div>
            </div>

            {/* Row 2: Collateral switch */}
            <div className="flex items-center gap-2">
              <Typography variant="small" color="submerged">
                Collateral
              </Typography>
              <Switch
                checked={position.usageAsCollateralEnabled}
                onCheckedChange={() => handleCollateralSwitch(position)}
                className="scale-75 origin-left"
              />
            </div>

            {/* Row 3: APY */}
            <div className="flex items-center gap-2">
              <Typography variant="small" color="submerged">
                APY
              </Typography>
              {position.supplyAPY === 0 ? (
                <Typography variant="small">-</Typography>
              ) : (
                <CountUp
                  value={position.supplyAPY}
                  suffix="%"
                  className="text-sm text-primary"
                  decimals={2}
                />
              )}
            </div>
          </div>

          {/* Right section (30%) - Action buttons */}
          <div className="flex flex-col w-[30%] gap-2 justify-center">
            <Button
              variant="gradient"
              size="sm"
              className="w-full rounded-md"
              onClick={() => handleSupplyClick(position)}
            >
              Supply
            </Button>
            <Button
              variant="outlineGradient"
              size="sm"
              className="w-full rounded-md"
              onClick={() => handleWithdrawClick(position)}
            >
              Withdraw
            </Button>
          </div>
        </div>
      ))}

      {/* Supply Dialog */}
      {selectedPosition && supplyDialogOpen && (
        <SupplyDialog
          open={supplyDialogOpen}
          onOpenChange={setSupplyDialogOpen}
          reserve={selectedPosition}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}

      {/* Withdraw Dialog */}
      {selectedPosition && withdrawDialogOpen && (
        <WithdrawDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          reserve={selectedPosition}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}

      {/* Collateral Dialog */}
      {selectedPosition && (
        <CollateralDialog
          open={collateralDialogOpen}
          onOpenChange={setCollateralDialogOpen}
          reserve={selectedPosition}
          accountData={accountData}
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
