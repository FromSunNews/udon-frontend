'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/tab';
import { Typography } from '@/components/common/typography';
import { UserReserveData, AvailableLiquidityToken } from '../../types';
import { Badge } from '@/components/common/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Button } from '@/components/common/button';
import { Switch } from '@/components/common/switch';
import { useRouter } from 'next/navigation';
import CountUp from '@/components/common/count-up';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { useState } from 'react';
import { SupplyDialog } from '../supply/supply-dialog';
import { WithdrawDialog } from '../supply/withdraw-dialog';
import { CollateralDialog } from '../supply/collateral-dialog';
import { BorrowDialog } from '../borrow/borrow-dialog';
import { RepayDialog } from '../borrow/repay-dialog';

interface MobilePositionTabsProps {
  supplyPositions: UserReserveData[];
  borrowPositions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  yourSupplyBalancePosition: number;
  yourSupplyCollateralPosition: number;
  yourSupplyAPYPosition: number;
  yourBorrowBalancePosition: number;
  yourBorrowPowerUsagePosition: number;
  yourBorrowAPYPosition: number;
  enableBorrow: boolean;
  availableLiquidityTokens: AvailableLiquidityToken[];
}

export const MobilePositionTabs: React.FC<MobilePositionTabsProps> = ({
  supplyPositions,
  borrowPositions,
  isLoading,
  mutateAssets,
  yourSupplyBalancePosition,
  yourSupplyCollateralPosition,
  yourSupplyAPYPosition,
  yourBorrowBalancePosition,
  yourBorrowPowerUsagePosition,
  yourBorrowAPYPosition,
  enableBorrow,
  availableLiquidityTokens,
}) => {
  const router = useRouter();

  // Dialog state management for Supply
  const [selectedSupplyPosition, setSelectedSupplyPosition] = useState<UserReserveData | null>(
    null
  );
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [collateralDialogOpen, setCollateralDialogOpen] = useState(false);

  // Dialog state management for Borrow
  const [selectedBorrowPosition, setSelectedBorrowPosition] = useState<UserReserveData | null>(
    null
  );
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);

  // Handle supply actions
  const handleSupplyClick = (position: UserReserveData) => {
    setSelectedSupplyPosition(position);
    setSupplyDialogOpen(true);
  };

  const handleWithdrawClick = (position: UserReserveData) => {
    setSelectedSupplyPosition(position);
    setWithdrawDialogOpen(true);
  };

  const handleCollateralSwitch = (position: UserReserveData) => {
    setSelectedSupplyPosition(position);
    setCollateralDialogOpen(true);
  };

  // Handle borrow actions
  const handleRepayClick = (position: UserReserveData) => {
    setSelectedBorrowPosition(position);
    setRepayDialogOpen(true);
  };

  const handleBorrowClick = (position: UserReserveData) => {
    setSelectedBorrowPosition(position);
    setBorrowDialogOpen(true);
  };

  // Handle asset click (navigation)
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  const renderAssetCell = (asset: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleAssetClick(asset.symbol)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={asset.iconUrl} alt={asset.symbol} />
                <AvatarFallback>{asset.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium">{asset.symbol}</Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{asset.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Tabs defaultValue="supply" className="w-full">
        <TabsList className="w-full h-14 rounded-t-2xl rounded-b-none bg-card p-0 border-b border-border">
          <TabsTrigger value="supply" className="flex-1 h-full py-4 text-base">
            Your Supply
          </TabsTrigger>
          <TabsTrigger value="borrow" className="flex-1 h-full py-4 text-base">
            Your Borrow
          </TabsTrigger>
        </TabsList>

        {/* Supply Positions Tab Content */}
        <TabsContent value="supply" className="px-4 py-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4 flex-wrap">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-5" />
                      </div>
                      <Skeleton className="w-10 h-5 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <Skeleton className="w-24 h-5 mb-1" />
                        <Skeleton className="w-16 h-4" />
                      </div>
                      <Skeleton className="w-16 h-5" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-full h-9" />
                      <Skeleton className="w-full h-9" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {supplyPositions.length > 0 ? (
                <>
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">Balance:</Typography>
                      {yourSupplyBalancePosition ? (
                        <CountUp
                          value={yourSupplyBalancePosition}
                          prefix="$"
                          className="text-sm ml-1"
                        />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">APY:</Typography>
                      {yourSupplyAPYPosition ? (
                        <CountUp
                          value={yourSupplyAPYPosition}
                          suffix="%"
                          className="text-sm ml-1"
                          decimals={4}
                        />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">Collateral:</Typography>
                      {yourSupplyCollateralPosition ? (
                        <CountUp
                          value={yourSupplyCollateralPosition}
                          prefix="$"
                          className="text-sm ml-1"
                        />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {supplyPositions.map(position => (
                      <div
                        key={position.symbol}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          {renderAssetCell(position)}
                          <Switch
                            checked={position.usageAsCollateralEnabled}
                            onCheckedChange={() => handleCollateralSwitch(position)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <CountUp
                              value={Number(position.currentATokenBalance)}
                              className="text-base"
                            />
                            <Typography variant="small" color="submerged">
                              <CountUp
                                value={Number(position.currentATokenBalance) * position.price}
                                prefix="$"
                                className="text-sm text-submerged"
                              />
                            </Typography>
                          </div>
                          <div>
                            {position.supplyAPY === 0 ? (
                              <Typography>_</Typography>
                            ) : (
                              <CountUp
                                value={position.supplyAPY}
                                suffix="%"
                                className="text-base"
                                decimals={4}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="gradient"
                            className="flex-1"
                            onClick={() => handleSupplyClick(position)}
                          >
                            Supply
                          </Button>
                          <Button
                            variant="outlineGradient"
                            className="flex-1"
                            onClick={() => handleWithdrawClick(position)}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-grow items-center justify-center py-10">
                  <Typography className="text-submerged text-center text-lg">
                    No supply positions found. <br />
                    Start supplying assets to earn interest.
                  </Typography>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Borrow Positions Tab Content */}
        <TabsContent value="borrow" className="px-4 py-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4 flex-wrap">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-24 h-5" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <Skeleton className="w-24 h-5 mb-1" />
                        <Skeleton className="w-16 h-4" />
                      </div>
                      <Skeleton className="w-16 h-5" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-full h-9" />
                      <Skeleton className="w-full h-9" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {borrowPositions.length > 0 ? (
                <>
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">Balance:</Typography>
                      {yourBorrowBalancePosition ? (
                        <CountUp
                          value={yourBorrowBalancePosition}
                          prefix="$"
                          className="text-sm ml-1"
                        />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">APY:</Typography>
                      {yourBorrowAPYPosition ? (
                        <CountUp
                          value={yourBorrowAPYPosition}
                          suffix="%"
                          className="text-sm ml-1"
                          decimals={4}
                        />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 gap-1">
                      <Typography weight="medium">Power Usage:</Typography>
                      {yourBorrowPowerUsagePosition ? (
                        <CountUp value={yourBorrowPowerUsagePosition} className="text-sm ml-1" />
                      ) : (
                        <Typography>_</Typography>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-4">
                    {borrowPositions.map(position => (
                      <div
                        key={position.symbol}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          {renderAssetCell(position)}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            {position.currentVariableDebt === 0 ? (
                              <Typography>_</Typography>
                            ) : (
                              <>
                                <CountUp
                                  value={position.currentVariableDebt}
                                  className="text-base"
                                />
                                <CountUp
                                  value={position.price * position.currentVariableDebt}
                                  prefix="$"
                                  decimals={2}
                                  className="text-sm text-submerged"
                                />
                              </>
                            )}
                          </div>
                          <div>
                            {position.borrowAPY === 0 ? (
                              <Typography>_</Typography>
                            ) : (
                              <CountUp
                                value={position.borrowAPY}
                                suffix="%"
                                className="text-base"
                                decimals={4}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="gradient"
                            className="flex-1"
                            onClick={() => handleBorrowClick(position)}
                            disabled={!enableBorrow}
                          >
                            Borrow
                          </Button>
                          <Button
                            variant="outlineGradient"
                            className="flex-1"
                            onClick={() => handleRepayClick(position)}
                          >
                            Repay
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-grow items-center justify-center py-10">
                  <Typography className="text-submerged text-center text-lg">
                    No borrow positions found. <br />
                    Start borrowing assets to leverage your portfolio.
                  </Typography>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Supply Dialogs */}
      {selectedSupplyPosition && supplyDialogOpen && (
        <SupplyDialog
          open={supplyDialogOpen}
          onOpenChange={setSupplyDialogOpen}
          reserve={selectedSupplyPosition}
          mutateAssets={mutateAssets}
        />
      )}

      {selectedSupplyPosition && withdrawDialogOpen && (
        <WithdrawDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          reserve={selectedSupplyPosition}
          healthFactor={1.23} // Placeholder value
          mutateAssets={mutateAssets}
        />
      )}

      {selectedSupplyPosition && collateralDialogOpen && (
        <CollateralDialog
          open={collateralDialogOpen}
          onOpenChange={setCollateralDialogOpen}
          reserve={selectedSupplyPosition}
          healthFactor={1.26} // Placeholder value
          newHealthFactor={selectedSupplyPosition.usageAsCollateralEnabled ? 1.1 : 2.4} // Placeholder value
          mutateAssets={mutateAssets}
        />
      )}

      {/* Borrow Dialogs */}
      {selectedBorrowPosition && repayDialogOpen && (
        <RepayDialog
          open={repayDialogOpen}
          onOpenChange={setRepayDialogOpen}
          reserve={selectedBorrowPosition}
          healthFactor={4.91} // Placeholder value
          mutateAssets={mutateAssets}
        />
      )}

      {selectedBorrowPosition && borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          reserve={selectedBorrowPosition}
          healthFactor={4.91} // Placeholder value
          mutateAssets={mutateAssets}
          availableLiquidityTokens={availableLiquidityTokens}
        />
      )}
    </div>
  );
};
