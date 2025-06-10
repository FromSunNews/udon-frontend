import React, { useState } from 'react';
import { UserReserveData } from '@/app/(protected)/dashboard/types';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/common/button';
import CountUp from '@/components/common/count-up';
import { SupplyDialog } from '@/app/(protected)/dashboard/components/supply/supply-dialog';
import { BorrowDialog } from '@/app/(protected)/dashboard/components/borrow/borrow-dialog';
import { CheckIcon, XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { useAccountData } from '@/hooks/contracts/queries/use-account-data';

interface SidePanelProps {
  reserve: UserReserveData;
}

export const SidePanel: React.FC<SidePanelProps> = ({ reserve }) => {
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const { data: accountData } = useAccountData();

  const handleRefresh = () => {
    // This would trigger a data refresh in a real implementation
    console.log('Refreshing data');
  };

  return (
    <div className="w-full mt-8 md:mt-0 md:sticky md:top-[100px] md:self-start">
      {/* Supply Panel */}
      <div className="w-full mb-7">
        <div className="bg-card border rounded-xl border-border overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Left Content Area - Main Information */}
            <div className="p-6 md:w-3/5">
              <Typography variant="h3" weight="semibold" className="text-xl mb-2">
                Supply
              </Typography>

              {/* Asset Info Row */}
              <div className="flex gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                  <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Typography weight="medium" className="text-lg">
                    {reserve.symbol}
                  </Typography>
                  <Typography className="text-sm text-submerged">
                    {reserve.name.replace(/USD$/, '')}
                  </Typography>
                </div>
              </div>

              {/* Table-like rows */}
              <div className="space-y-4.5">
                <div className="flex justify-between py-1.5">
                  <Typography className="text-base">Price</Typography>
                  <CountUp
                    value={reserve.price}
                    decimals={2}
                    prefix="$"
                    className="text-submerged"
                  />
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <Typography className="text-base">APY</Typography>
                  <Typography className="font-medium text-emerald-500">
                    <CountUp value={reserve.supplyAPY} decimals={2} suffix="%" />
                  </Typography>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <Typography className="text-base">Collateral</Typography>
                  <div className="flex items-center gap-1.5">
                    {reserve.usageAsCollateralEnabled ? (
                      <CheckIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XIcon className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>

                <div className="flex justify-between py-1.5">
                  <Typography className="text-base">Balance</Typography>
                  <div className="flex flex-col items-end">
                    <CountUp value={reserve.balance} decimals={2} suffix={` ${reserve.symbol}`} />
                    <CountUp
                      value={reserve.price * reserve.balance}
                      decimals={2}
                      prefix="$"
                      className="text-submerged"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area - Action Button */}
            <div className="md:w-2/5 bg-background/60 p-4 flex flex-col justify-center items-center">
              <div className="w-full">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full h-10 mb-3 font-medium text-base"
                  onClick={() => setSupplyDialogOpen(true)}
                  disabled={reserve.balance <= 0}
                >
                  Supply
                </Button>
                <Typography className="text-sm text-center text-muted-foreground">
                  Supply your {reserve.symbol} to earn{' '}
                  <span className="text-emerald-500 font-medium">
                    {reserve.supplyAPY.toFixed(4)}% APY
                  </span>
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Panel */}
      <div className="w-full">
        <div className="bg-card border rounded-xl border-border overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row">
            {/* Left Content Area - Main Information */}
            <div className="p-6 md:w-3/5">
              <Typography variant="h3" weight="semibold" className="text-xl mb-2">
                Borrow
              </Typography>

              {/* Asset Info Row */}
              <div className="flex gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                  <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Typography weight="medium" className="text-lg">
                    {reserve.symbol}
                  </Typography>
                  <Typography className="text-sm text-submerged">
                    {reserve.name.replace(/USD$/, '')}
                  </Typography>
                </div>
              </div>

              {/* Table-like rows */}
              <div className="space-y-4.5">
                <div className="flex justify-between items-center py-1.5">
                  <Typography className="text-base">Price</Typography>
                  <CountUp
                    value={reserve.price}
                    decimals={2}
                    prefix="$"
                    className="text-submerged"
                  />
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <Typography className="text-base">APY</Typography>
                  <CountUp
                    value={reserve.borrowAPY}
                    decimals={2}
                    suffix="%"
                    className="text-blue-500"
                  />
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <Typography className="text-base">Liquidation threshold</Typography>
                  <CountUp
                    value={reserve.liquidationThreshold}
                    suffix="%"
                    className="text-submerged"
                  />
                </div>

                <div className="flex justify-between  py-1.5">
                  <Typography className="text-base">Available</Typography>
                  <div className="flex flex-col items-end">
                    <CountUp
                      value={reserve.availableLiquidity}
                      decimals={2}
                      suffix={` ${reserve.symbol}`}
                    />
                    <CountUp
                      value={reserve.price * reserve.availableLiquidity}
                      decimals={2}
                      prefix="$"
                      className="text-submerged"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area - Action Button */}
            <div className="md:w-2/5 bg-background/60 p-4 flex flex-col justify-center items-center">
              <div className="w-full">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full h-10 mb-3 font-medium text-base"
                  onClick={() => setBorrowDialogOpen(true)}
                  disabled={reserve.availableLiquidity <= 0}
                >
                  Borrow
                </Button>
                <Typography className="text-sm text-center text-muted-foreground">
                  Borrow {reserve.symbol} at{' '}
                  <span className="text-blue-500 font-medium">
                    {reserve.borrowAPY.toFixed(4)}% APY
                  </span>
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {supplyDialogOpen && (
        <SupplyDialog
          open={supplyDialogOpen}
          onOpenChange={setSupplyDialogOpen}
          reserve={reserve}
          mutateAssets={handleRefresh}
          accountData={accountData}
        />
      )}

      {borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          reserve={reserve}
          mutateAssets={handleRefresh}
          accountData={accountData}
        />
      )}
    </div>
  );
};
