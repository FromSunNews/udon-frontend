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

interface SupplyPositionTableProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  yourBalancePosition: number;
  yourCollateralPosition: number;
  yourAPYPosition: number;
}

export const SupplyPositionTable: React.FC<SupplyPositionTableProps> = ({
  positions,
  isLoading,
  mutateAssets,
  yourBalancePosition,
  yourCollateralPosition,
  yourAPYPosition,
}) => {
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

  // Render asset icon and symbol
  const renderAssetCell = (row: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
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
    },
    {
      header: 'Amount',
      accessorKey: 'currentATokenBalance',
      cell: ({ row }) => {
        const balance = row.currentATokenBalance;
        const balanceUsd = Number(balance) * (row.price || 0);
        return (
          <div>
            <Typography weight="medium">{balance.toString()}</Typography>
            <Typography variant="small" color="submerged">
              ${balanceUsd.toFixed(2)}
            </Typography>
          </div>
        );
      },
    },
    {
      header: 'APY',
      accessorKey: 'reserveCurrentLiquidityRate',
      cell: ({ row }) => {
        return <Typography weight="medium">{row.supplyAPY.toFixed(4)}%</Typography>;
      },
    },
    {
      header: 'Collateral',
      accessorKey: 'usageAsCollateralEnabled',
      cell: ({ row }: { row: UserReserveData }) => (
        <Switch
          checked={row.usageAsCollateralEnabled}
          onCheckedChange={() => handleCollateralSwitch(row)}
        />
      ),
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
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Typography variant="h4" weight="semibold" className="mb-4 text-2xl">
        Your Supply
      </Typography>
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-32" />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          {positions.length > 0 ? (
            <>
              <div className="flex gap-4 mb-4 flex-wrap">
                <Badge variant="outline" className="text-base px-3">
                  Balance: ${yourBalancePosition?.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  APY: {yourAPYPosition?.toFixed(2)}%
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  Collateral: ${yourCollateralPosition?.toFixed(2)}
                </Badge>
              </div>
              <SortableTable
                data={positions}
                columns={columns}
                pageSize={4}
                className="bg-transparent border-none"
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No supply positions found. <br />
              Start supplying assets to earn interest.
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
          healthFactor={1.26} // TODO: calulate HF
          newHealthFactor={selectedCollateral.usageAsCollateralEnabled ? 1.1 : 2.4} // TODO: calculate
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
