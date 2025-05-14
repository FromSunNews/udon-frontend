'use client';

import React, { useState } from 'react';
import { SortableTable, ColumnDef } from '@/components/common/sortable-table';
import { Button } from '@/components/common/button';
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
import { RepayDialog } from './repay-dialog';
import { BorrowDialog } from './borrow-dialog';
import { CommonAsset } from '../../types';

interface UserReserveData {
  asset: CommonAsset;
  current_a_token_balance: bigint;
  current_variable_debt: bigint;
  scaled_variable_debt: bigint;
  liquidity_rate: bigint;
  usage_as_collateral_enabled: boolean;
}

interface BorrowPositionTableProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
}

export const BorrowPositionTable: React.FC<BorrowPositionTableProps> = ({
  positions,
  isLoading,
  mutateAssets,
}) => {
  // Dialog state management
  const [selectedPosition, setSelectedPosition] = useState<UserReserveData | null>(null);
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);

  // Handle repay button click for a position
  const handleRepayClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setRepayDialogOpen(true);
  };

  // Handle borrow button click for a position
  const handleBorrowClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setBorrowDialogOpen(true);
  };

  // Calculate total debt balance in USD
  const totalBalanceUsd = positions.reduce((sum, position) => {
    const balance = Number(position.current_variable_debt) / Math.pow(10, position.asset.decimals);
    return sum + balance * (position.asset.price || 0);
  }, 0);

  // Calculate average APY
  const averageApy =
    positions.length > 0
      ? positions.reduce((sum, position) => sum + Number(position.liquidity_rate) / 1e25, 0) /
        positions.length
      : 0;

  // Render asset icon and symbol
  const renderAssetCell = (asset: CommonAsset) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src={asset.icon_url} alt={asset.symbol} />
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

  const columns: ColumnDef<UserReserveData>[] = [
    {
      header: 'Assets',
      accessorKey: 'asset',
      cell: ({ row }) => renderAssetCell(row.asset),
    },
    {
      header: 'Debt',
      accessorKey: 'current_variable_debt',
      cell: ({ row }) => {
        const balance = Number(row.current_variable_debt) / Math.pow(10, row.asset.decimals);
        const balanceUsd = balance * (row.asset.price || 0);
        return (
          <div>
            <Typography weight="medium">{balance.toFixed(4)}</Typography>
            <Typography variant="small" color="submerged">
              ${balanceUsd.toFixed(2)}
            </Typography>
          </div>
        );
      },
    },
    {
      header: 'APY',
      accessorKey: 'liquidity_rate',
      cell: ({ row }) => {
        // For borrow APY, we might use a different rate (variable borrow rate)
        // This is a placeholder - adjust based on actual data structure
        const apy = Number(row.liquidity_rate) / 1e25;
        return <Typography weight="medium">{apy.toFixed(2)}%</Typography>;
      },
    },
    {
      header: 'Type',
      accessorKey: 'asset',
      cell: () => <Badge variant="secondary">VARIABLE</Badge>,
    },
    {
      header: '',
      accessorKey: 'asset',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex flex-col gap-2">
            <Button variant="gradient" className="w-[100px]" onClick={() => handleBorrowClick(row)}>
              Borrow
            </Button>
            <Button
              variant="outlineGradient"
              className="w-[100px]"
              onClick={() => handleRepayClick(row)}
            >
              Repay
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Typography variant="h4" weight="semibold" className="mb-4 text-2xl">
        Your Borrow
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
              <div className="flex gap-3 mb-4 flex-wrap">
                <Badge variant="outline" className="text-base px-3">
                  Balance: ${totalBalanceUsd.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  APY: {averageApy.toFixed(2)}%
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  Health Factor: {positions.length > 0 ? '1.75' : 'N/A'}
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
              No borrow positions found. <br /> Start borrowing assets to leverage your portfolio.
            </div>
          )}
        </>
      )}

      {/* Repay Dialog */}
      {selectedPosition && repayDialogOpen && (
        <RepayDialog
          open={repayDialogOpen}
          onOpenChange={setRepayDialogOpen}
          asset={selectedPosition.asset}
          debtBalance={(
            Number(selectedPosition.current_variable_debt) /
            Math.pow(10, selectedPosition.asset.decimals)
          ).toFixed(7)}
          walletBalance="0.0021429" // This would come from wallet balance query
          healthFactor={4.91} // This would be calculated based on user's positions
          mutateAssets={mutateAssets}
        />
      )}

      {/* Borrow Dialog */}
      {selectedPosition && borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          asset={selectedPosition.asset}
          availableToBorrow="0.05" // This would come from available liquidity calculation
          healthFactor={4.91} // This would be calculated based on user's positions
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
