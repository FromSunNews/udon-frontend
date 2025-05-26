'use client';

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/tab';
import { Typography } from '@/components/common/typography';
import { Button } from '@/components/common/button';
import { CheckIcon, XIcon } from 'lucide-react';
import { UserReserveData, AvailableLiquidityToken } from '../../types';
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
  availableLiquidityTokens: AvailableLiquidityToken[];
}

export const MobileAssetTabs: React.FC<MobileAssetTabsProps> = ({
  processedAssets,
  isLoading,
  mutateAssets,
  enableBorrow,
  availableLiquidityTokens,
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
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  // Render asset icon and symbol
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
                  <div key={i} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="w-7/12">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-24 h-5" />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Typography variant="small" color="submerged" className="mb-1">
                              Wallet balance
                            </Typography>
                            <div className="flex flex-col">
                              <Skeleton className="w-20 h-5" />
                              <Skeleton className="w-16 h-4 mt-1" />
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                APY
                              </Typography>
                              <Skeleton className="w-16 h-5" />
                            </div>
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                Collateral
                              </Typography>
                              <Skeleton className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-2">
                        <Skeleton className="w-[100px] h-9" />
                        <Skeleton className="w-[100px] h-9" />
                      </div>
                    </div>
                  </div>
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
                  {processedAssets.map(asset => (
                    <div
                      key={asset.symbol}
                      className="border border-border rounded-lg p-4 bg-background/30"
                    >
                      <div className="flex justify-between">
                        <div className="w-7/12">
                          <div className="mb-3">{renderAssetCell(asset)}</div>
                          <div className="space-y-3">
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                Wallet balance
                              </Typography>
                              <div className="flex flex-col">
                                {asset.balance === 0 ? (
                                  <Typography>_</Typography>
                                ) : (
                                  <>
                                    <CountUp value={asset.balance} className="text-base" />
                                    <CountUp
                                      value={asset.price * asset.balance}
                                      prefix="$"
                                      className="text-sm text-submerged"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-6">
                              <div>
                                <Typography variant="small" color="submerged" className="mb-1">
                                  APY
                                </Typography>
                                {asset.supplyAPY === 0 ? (
                                  <Typography>_</Typography>
                                ) : (
                                  <CountUp
                                    value={asset.supplyAPY}
                                    suffix="%"
                                    className="text-base"
                                    decimals={2}
                                  />
                                )}
                              </div>
                              <div>
                                <Typography variant="small" color="submerged" className="mb-1">
                                  Collateral
                                </Typography>
                                <div className="flex justify-center">
                                  {asset.usageAsCollateralEnabled ? (
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <XIcon className="w-5 h-5 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-2">
                          <Button
                            variant="gradient"
                            onClick={() => handleSupplyClick(asset)}
                            disabled={asset.balance === 0}
                            className="w-[100px]"
                          >
                            Supply
                          </Button>
                          <Button
                            variant="outlineGradient"
                            onClick={() => handleAssetClick(asset.symbol)}
                            className="w-[100px]"
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
                  <div key={i} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="w-7/12">
                        <div className="flex items-center gap-3 mb-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-24 h-5" />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Typography variant="small" color="submerged" className="mb-1">
                              Available
                            </Typography>
                            <Skeleton className="w-20 h-5" />
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                Price
                              </Typography>
                              <Skeleton className="w-16 h-5" />
                            </div>
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                APY
                              </Typography>
                              <Skeleton className="w-16 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-2">
                        <Skeleton className="w-[100px] h-9" />
                        <Skeleton className="w-[100px] h-9" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {processedAssets.length > 0 ? (
                <div className="space-y-4">
                  {processedAssets.map(asset => (
                    <div
                      key={asset.symbol}
                      className="border border-border rounded-lg p-4 bg-background/30"
                    >
                      <div className="flex justify-between">
                        <div className="w-7/12">
                          <div className="mb-3">{renderAssetCell(asset)}</div>
                          <div className="space-y-3">
                            <div>
                              <Typography variant="small" color="submerged" className="mb-1">
                                Available
                              </Typography>
                              {(() => {
                                const availableLiquidityToken =
                                  availableLiquidityTokens.find(
                                    t => t.assetId.toString('hex') === asset.assetId.toString('hex')
                                  )?.availableLiquidityToken || 0;

                                return availableLiquidityToken === 0 ? (
                                  <Typography>_</Typography>
                                ) : (
                                  <CountUp value={availableLiquidityToken} className="text-base" />
                                );
                              })()}
                            </div>
                            <div className="flex gap-6">
                              <div>
                                <Typography variant="small" color="submerged" className="mb-1">
                                  Price
                                </Typography>
                                <CountUp value={asset.price} prefix="$" className="text-base" />
                              </div>
                              <div>
                                <Typography variant="small" color="submerged" className="mb-1">
                                  APY
                                </Typography>
                                {asset.borrowAPY === 0 ? (
                                  <Typography>_</Typography>
                                ) : (
                                  <CountUp
                                    value={asset.borrowAPY}
                                    suffix="%"
                                    className="text-base"
                                    decimals={2}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-2">
                          <Button
                            variant="gradient"
                            onClick={() => handleBorrowClick(asset)}
                            disabled={!enableBorrow}
                            className="w-[100px]"
                          >
                            Borrow
                          </Button>
                          <Button
                            variant="outlineGradient"
                            onClick={() => handleAssetClick(asset.symbol)}
                            className="w-[100px]"
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
        />
      )}

      {/* Borrow Dialog */}
      {selectedAsset && borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          reserve={selectedAsset}
          mutateAssets={mutateAssets}
          availableLiquidityTokens={availableLiquidityTokens}
        />
      )}
    </div>
  );
};
