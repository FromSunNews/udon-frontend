'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/tab/anim-underline';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/common/button';
import { CheckIcon } from 'lucide-react';
import { UserReserveData, UserAccountData } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Skeleton } from '@/components/common/skeleton';
import { FaucetTestBadge } from '../faucet-badge';
import { SupplyDialog } from '../supply/supply-dialog';
import { BorrowDialog } from '../borrow/borrow-dialog';
import CountUp from '@/components/common/count-up';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';

interface MobileAssetTabsProps {
  processedAssets: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  enableBorrow: boolean;
  accountData: UserAccountData;
}

export const MobileAssetTabs: React.FC<MobileAssetTabsProps> = ({
  processedAssets,
  isLoading,
  mutateAssets,
  enableBorrow,
  accountData,
}) => {
  const router = useRouter();

  // State for dialogs
  const [selectedAsset, setSelectedAsset] = useState<UserReserveData | null>(null);
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);

  // Handle supply button click
  const handleSupplyClick = (asset: UserReserveData) => {
    setSelectedAsset(asset);
    setSupplyDialogOpen(true);
  };

  // Handle borrow button click
  const handleBorrowClick = (asset: UserReserveData) => {
    setSelectedAsset(asset);
    setBorrowDialogOpen(true);
  };

  // Handle asset click (navigation)
  const handleAssetClick = (assetId: string) => {
    router.push(`/reserve/${assetId}`);
  };

  // Render asset icon and symbol
  const renderAssetCell = (asset: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleAssetClick(asset.assetId.toString('hex'))}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={asset.iconUrl} alt={asset.symbol} />
                <AvatarFallback>{asset.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium" className="text-2xl">
                {asset.symbol}
              </Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{asset.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Supply card skeleton
  const SupplyCardSkeleton = () => (
    <div className="border border-border rounded-lg py-3 px-4 bg-black/20">
      <div className="flex">
        {/* Left section */}
        <div className="flex flex-1 flex-col">
          {/* Row 1: Asset */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-16 h-6" />
          </div>

          {/* Col layout for Price/APY and Collateral/Balance */}
          <div className="flex mt-2">
            {/* Col 1: Price and APY */}
            <div className="w-[40%]">
              <div className="mb-2">
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Price
                </Typography>
                <Skeleton className="w-16 h-5" />
              </div>
              <div>
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  APY
                </Typography>
                <Skeleton className="w-16 h-5" />
              </div>
            </div>

            {/* Col 2: Collateral and Balance */}
            <div className="flex-1">
              {/* Don't have mb-1 because height icon greatter than text */}
              <div className="mb-2">
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Collateral
                </Typography>
                <Skeleton className="w-4 h-4" />
              </div>
              <div>
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Balance
                </Typography>
                <Skeleton className="w-24 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col gap-2 justify-center">
          <Skeleton className="w-[60px] h-6 rounded-md" />
          <Skeleton className="w-[60px] h-6 rounded-md" />
        </div>
      </div>
    </div>
  );

  // Borrow card skeleton
  const BorrowCardSkeleton = () => (
    <div className="border border-border rounded-lg py-3 px-4 bg-black/20">
      <div className="flex">
        {/* Left section */}
        <div className="flex flex-1 flex-col">
          {/* Row 1: Asset */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-16 h-6" />
          </div>

          {/* Col layout for Price/APY and Available/Balance */}
          <div className="flex mt-2">
            {/* Col 1: Price and APY */}
            <div className="w-[40%]">
              <div className="mb-2">
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Price
                </Typography>
                <Skeleton className="w-16 h-5" />
              </div>
              <div>
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  APY
                </Typography>
                <Skeleton className="w-16 h-5" />
              </div>
            </div>

            {/* Col 2: Available and Balance */}
            <div className="flex-1">
              <div className="mb-2">
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Available
                </Typography>
                <Skeleton className="w-24 h-5" />
              </div>
              <div>
                <Typography color="submerged" className="mb-[2px] text-[12px]">
                  Balance
                </Typography>
                <Skeleton className="w-24 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col gap-2 justify-center">
          <Skeleton className="w-[60px] h-6 rounded-md" />
          <Skeleton className="w-[60px] h-6 rounded-md" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Tabs defaultValue="supply" className="w-full">
        <TabsList className="w-full h-14 rounded-t-2xl rounded-b-none bg-card p-0 border border-b border-border">
          <TabsTrigger value="supply" className="flex-1 h-full py-4 text-base">
            Assets to supply
          </TabsTrigger>
          <TabsTrigger value="borrow" className="flex-1 h-full py-4 text-base">
            Assets to borrow
          </TabsTrigger>
        </TabsList>

        {/* Supply Assets Tab Content */}
        <TabsContent value="supply" className="px-4 py-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <SupplyCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <FaucetTestBadge isLoading={isLoading} />
              </div>
              {processedAssets.length > 0 ? (
                <div className="space-y-4">
                  {processedAssets.map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className={`border border-border rounded-lg py-3 px-4 ${
                        index % 2 === 0 ? 'bg-black/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex">
                        {/* Left section */}
                        <div className="flex flex-1 flex-col">
                          {/* Row 1: Asset */}
                          <div className="">{renderAssetCell(asset)}</div>

                          {/* Col layout for Price/APY and Collateral/Balance */}
                          <div className="flex mt-2">
                            {/* Col 1: Price and APY */}
                            <div className="w-[40%]">
                              <div className="mb-2">
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Price
                                </Typography>
                                <CountUp value={asset.price} prefix="$" />
                              </div>
                              <div>
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  APY
                                </Typography>
                                {asset.supplyAPY === 0 ? (
                                  <Typography>-</Typography>
                                ) : (
                                  <CountUp value={asset.supplyAPY} suffix="%" decimals={2} />
                                )}
                              </div>
                            </div>

                            {/* Col 2: Collateral and Balance */}
                            <div className="flex-1">
                              {/* Don't have mb-1 because height icon greatter than text */}
                              <div className="mb-2">
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Collateral
                                </Typography>
                                <div className="flex items-center">
                                  {asset.usageAsCollateralEnabled ? (
                                    <CheckIcon className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <span className="text-red-500">-</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Balance
                                </Typography>
                                {asset.balance === 0 ? (
                                  <Typography>-</Typography>
                                ) : (
                                  <div className="flex flex-row items-center gap-1">
                                    <CountUp value={asset.balance} className="text-base" />
                                    <Typography color="submerged">~</Typography>
                                    <CountUp
                                      value={asset.price * asset.balance}
                                      className="text-base text-submerged"
                                      prefix="$"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right section */}
                        <div className="flex flex-col gap-2 justify-center">
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => handleSupplyClick(asset)}
                            disabled={asset.balance === 0}
                            className="w-[80px] !py-0 !px-2 text-base"
                          >
                            Supply
                          </Button>
                          <Button
                            variant="outlineGradient"
                            size="sm"
                            onClick={() => handleAssetClick(asset.assetId.toString('hex'))}
                            className="w-[80px] !py-0 !px-2 text-base"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-grow items-center justify-center py-10">
                  <Typography className="text-submerged text-center text-lg">
                    Assets are not available for supply at this time.
                  </Typography>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Borrow Assets Tab Content */}
        <TabsContent value="borrow" className="px-4 py-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-48" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <BorrowCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {processedAssets.length > 0 ? (
                <div className="space-y-4">
                  {processedAssets.map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className={`border border-border rounded-lg py-3 px-4 ${
                        index % 2 === 0 ? 'bg-black/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex">
                        {/* Left section */}
                        <div className="flex flex-1 flex-col">
                          {/* Row 1: Asset */}
                          <div className="">{renderAssetCell(asset)}</div>

                          {/* Col layout for Price/APY and Available/Balance */}
                          <div className="flex mt-2">
                            {/* Col 1: Price and APY */}
                            <div className="w-[40%]">
                              <div className="mb-2">
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Price
                                </Typography>
                                <CountUp value={asset.price} prefix="$" />
                              </div>
                              <div>
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  APY
                                </Typography>
                                {asset.borrowAPY === 0 ? (
                                  <Typography>-</Typography>
                                ) : (
                                  <CountUp value={asset.borrowAPY} suffix="%" decimals={2} />
                                )}
                              </div>
                            </div>

                            {/* Col 2: Available and Balance */}
                            <div className="flex-1">
                              <div className="mb-2">
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Available
                                </Typography>
                                {asset.availableLiquidity === 0 ? (
                                  <Typography>-</Typography>
                                ) : (
                                  <div className="flex flex-row items-center gap-1">
                                    <CountUp
                                      value={asset.availableLiquidity}
                                      className="text-base"
                                    />
                                    <Typography color="submerged">~</Typography>
                                    <CountUp
                                      value={asset.price * asset.availableLiquidity}
                                      className="text-base text-submerged"
                                      prefix="$"
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <Typography color="submerged" className="mb-[2px] text-[12px]">
                                  Balance
                                </Typography>
                                {!asset.currentVariableDebt || asset.currentVariableDebt === 0 ? (
                                  <Typography>-</Typography>
                                ) : (
                                  <div className="flex flex-row items-center gap-1">
                                    <CountUp
                                      value={asset.currentVariableDebt}
                                      className="text-base"
                                    />
                                    <Typography color="submerged">~</Typography>
                                    <CountUp
                                      value={asset.price * asset.currentVariableDebt}
                                      className="text-base text-submerged"
                                      prefix="$"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right section */}
                        <div className="flex flex-col gap-2 justify-center">
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={() => handleBorrowClick(asset)}
                            disabled={!enableBorrow}
                            className="w-[60px] !py-0 !px-2 text-sm"
                          >
                            Borrow
                          </Button>
                          <Button
                            variant="outlineGradient"
                            size="sm"
                            onClick={() => handleAssetClick(asset.assetId.toString('hex'))}
                            className="w-[60px] !py-0 !px-2 text-sm"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-grow items-center justify-center py-10">
                  <Typography className="text-submerged text-center text-lg">
                    No reserves available for borrowing at this time.
                  </Typography>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Supply Dialog */}
      {selectedAsset && supplyDialogOpen && (
        <SupplyDialog
          open={supplyDialogOpen}
          onOpenChange={setSupplyDialogOpen}
          reserve={selectedAsset}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}

      {/* Borrow Dialog */}
      {selectedAsset && borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          reserve={selectedAsset}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}
    </div>
  );
};
