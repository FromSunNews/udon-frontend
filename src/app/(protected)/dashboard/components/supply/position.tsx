'use client';

import React, { useState } from 'react';
import { SortableTable, ColumnDef } from '@/components/common/sortable-table';
import { Button } from '@/components/common/button';
import { Switch } from '@/components/common/switch';
import { Typography } from '@/components/common/typography';
import { Badge } from '@/components/common/badge';
import { Skeleton } from '@/components/common/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { SupplyDialog } from './supply-dialog';
import { WithdrawDialog } from './withdraw-dialog';
import { CollateralDialog } from './collateral-dialog';
import { UserReserveData } from '../../types';
import { useRouter } from 'next/navigation';
import CountUp from '@/components/common/count-up';

interface SupplyPositionTableProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  yourSupplyBalancePosition: number;
  yourSupplyCollateralPosition: number;
  yourSupplyAPYPosition: number;
}

export const SupplyPositionTable: React.FC<SupplyPositionTableProps> = ({
  positions,
  isLoading,
  mutateAssets,
  yourSupplyBalancePosition,
  yourSupplyCollateralPosition,
  yourSupplyAPYPosition,
}) => {
  const router = useRouter();

  // Dialog state management
  const [selectedPosition, setSelectedPosition] = useState<UserReserveData | null>(null);
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  // Collateral dialog state
  const [collateralDialogOpen, setCollateralDialogOpen] = useState(false);
  const [selectedCollateral, setSelectedCollateral] = useState<UserReserveData | null>(null);

  // Handle supply button click for a position
  const handleSupplyClick = (position: UserReserveData) => {
    console.log('position', position);
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
    setSelectedCollateral(position);
    setCollateralDialogOpen(true);
  };

  // Handle asset click
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  // Render asset icon and symbol
  const renderAssetCell = (row: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleAssetClick(row.symbol)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={row.iconUrl} alt={row.symbol} />
                <AvatarFallback>{row.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium">{row.symbol}</Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Define columns for the positions table
  const columns: ColumnDef<UserReserveData>[] = [
    {
      header: 'Assets',
      accessorKey: 'symbol',
      cell: ({ row }) => renderAssetCell(row),
      enableSorting: true,
      meta: {
        skeleton: (
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-5" />
          </div>
        ),
      },
    },
    {
      header: 'Amount',
      accessorKey: 'currentATokenBalance',
      enableSorting: true,
      cell: ({ row }) => {
        const balance = row.currentATokenBalance;
        const balanceUsd = Number(balance) * (row.price || 0);
        return (
          <div className="flex flex-col gap-2">
            <CountUp value={Number(balance)} className="text-base" />
            <Typography variant="small" color="submerged">
              <CountUp value={balanceUsd} prefix="$" className="text-sm text-submerged" />
            </Typography>
          </div>
        );
      },
      meta: {
        skeleton: (
          <div>
            <Skeleton className="w-24 h-5 mb-1" />
            <Skeleton className="w-16 h-4" />
          </div>
        ),
      },
    },
    {
      header: 'APY',
      accessorKey: 'supplyAPY',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.supplyAPY === 0) {
          return <Typography>_</Typography>;
        } else {
          return <CountUp value={row.supplyAPY} suffix="%" className="text-base" />;
        }
      },
      meta: {
        skeleton: <Skeleton className="w-16 h-5" />,
      },
    },
    {
      header: 'Collateral',
      accessorKey: 'usageAsCollateralEnabled',
      cell: ({ row }) => (
        <Switch
          checked={row.usageAsCollateralEnabled}
          onCheckedChange={() => handleCollateralSwitch(row)}
        />
      ),
      meta: {
        skeleton: <Skeleton className="w-10 h-5 rounded-full" />,
      },
    },
    {
      header: '',
      accessorKey: 'symbol',
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <div className="flex flex-col gap-2">
              <Button
                variant="gradient"
                className="w-[100px]"
                onClick={() => handleSupplyClick(row)}
              >
                Supply
              </Button>
              <Button
                variant="outlineGradient"
                className="w-[100px]"
                onClick={() => handleWithdrawClick(row)}
              >
                Withdraw
              </Button>
            </div>
          </div>
        );
      },
      meta: {
        skeleton: (
          <div className="flex justify-end">
            <div className="flex flex-col gap-2">
              <Skeleton className="w-[100px] h-9" />
              <Skeleton className="w-[100px] h-9" />
            </div>
          </div>
        ),
      },
    },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
      {isLoading ? (
        <Skeleton className="h-8 w-48 mb-4" />
      ) : (
        <Typography variant="h4" weight="semibold" className="mb-4 text-2xl">
          Your Supply
        </Typography>
      )}
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-4 mb-4 flex-wrap">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-32" />
          </div>
          <SortableTable<UserReserveData>
            data={[]}
            columns={columns}
            pageSize={4}
            className="bg-transparent border-none"
            isLoading={true}
            skeletonRows={3}
          />
        </div>
      ) : (
        <>
          {positions.length > 0 ? (
            <>
              <div className="flex gap-4 mb-4 flex-wrap">
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">Balance:</Typography>
                  {yourSupplyBalancePosition ? (
                    <CountUp
                      value={yourSupplyBalancePosition}
                      prefix="$"
                      className="text-base ml-1"
                    />
                  ) : (
                    <Typography>_</Typography>
                  )}
                </Badge>
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">APY:</Typography>
                  {yourSupplyAPYPosition ? (
                    <CountUp value={yourSupplyAPYPosition} suffix="%" className="text-base ml-1" />
                  ) : (
                    <Typography>_</Typography>
                  )}
                </Badge>
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">Collateral:</Typography>
                  {yourSupplyCollateralPosition ? (
                    <CountUp
                      value={yourSupplyCollateralPosition}
                      prefix="$"
                      className="text-base ml-1"
                    />
                  ) : (
                    <Typography>_</Typography>
                  )}
                </Badge>
              </div>
              <SortableTable<UserReserveData>
                data={positions}
                columns={columns}
                className="bg-transparent border-none"
              />
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <Typography className="text-submerged text-center text-lg">
                No supply positions found. <br />
                Start supplying assets to earn interest.
              </Typography>
            </div>
          )}
        </>
      )}

      {/* Supply Dialog */}
      {selectedPosition && supplyDialogOpen && (
        <SupplyDialog
          open={supplyDialogOpen}
          onOpenChange={setSupplyDialogOpen}
          reserve={selectedPosition}
          mutateAssets={mutateAssets}
        />
      )}

      {/* Withdraw Dialog */}
      {selectedPosition && withdrawDialogOpen && (
        <WithdrawDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          reserve={selectedPosition}
          healthFactor={1.23} // This would be calculated based on user's positions
          mutateAssets={mutateAssets}
        />
      )}

      {/* Collateral Dialog */}
      {selectedCollateral && (
        <CollateralDialog
          open={collateralDialogOpen}
          onOpenChange={setCollateralDialogOpen}
          reserve={selectedCollateral}
          healthFactor={1.26} // Using a placeholder value, would be calculated based on actual data
          newHealthFactor={selectedCollateral.usageAsCollateralEnabled ? 1.1 : 2.4} // Would be dynamically calculated
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
