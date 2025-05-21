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
import { UserReserveData } from '../../types';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
    const balance = Number(position.currentVariableDebt) / Math.pow(10, position.decimals);
    return sum + balance * (position.price || 0);
  }, 0);

  // Calculate average APY
  const averageApy =
    positions.length > 0
      ? positions.reduce(
          (sum, position) => sum + Number(position.reserveCurrentLiquidityRate) / 1e25,
          0
        ) / positions.length
      : 0;

  // Handle asset click
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  // Render reserve. icon and symbol
  const renderAssetCell = (reserve: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleAssetClick(reserve.symbol)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium">{reserve.symbol}</Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{reserve.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const columns: ColumnDef<UserReserveData>[] = [
    {
      header: 'Assets',
      accessorKey: 'symbol',
      enableSorting: true,
      cell: ({ row }) => renderAssetCell(row),
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
      header: 'Debt',
      accessorKey: 'currentVariableDebt',
      enableSorting: true,
      cell: ({ row }) => {
        const balance = Number(row.currentVariableDebt) / Math.pow(10, row.decimals);
        const balanceUsd = balance * (row.price || 0);
        return (
          <div>
            <Typography weight="medium">{balance.toFixed(4)}</Typography>
            <Typography variant="small" color="submerged">
              ${balanceUsd.toFixed(2)}
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
      accessorKey: 'reserveCurrentLiquidityRate',
      enableSorting: true,
      cell: ({ row }) => {
        // For borrow APY, we might use a different rate (variable borrow rate)
        // This is a placeholder - adjust based on actual data structure
        const apy = Number(row.reserveCurrentLiquidityRate) / 1e25;
        return <Typography weight="medium">{apy.toFixed(2)}%</Typography>;
      },
      meta: {
        skeleton: <Skeleton className="w-16 h-5" />,
      },
    },
    {
      header: '',
      accessorKey: 'symbol',
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
          Your Borrow
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
              <SortableTable<UserReserveData>
                data={positions}
                columns={columns}
                pageSize={4}
                className="bg-transparent border-none"
                skeletonRows={5}
              />
            </>
          ) : (
            <div className="flex flex-grow items-center justify-center">
              <Typography className="text-submerged text-center text-lg">
                No borrow positions found. <br /> Start borrowing assets to leverage your portfolio.
              </Typography>
            </div>
          )}
        </>
      )}

      {/* Repay Dialog */}
      {selectedPosition && repayDialogOpen && (
        <RepayDialog
          open={repayDialogOpen}
          onOpenChange={setRepayDialogOpen}
          reserve={selectedPosition}
          debtBalance={(
            Number(selectedPosition.reserveCurrentLiquidityRate) /
            Math.pow(10, selectedPosition.decimals)
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
          reserve={selectedPosition}
          healthFactor={4.91} // This would be calculated based on user's positions
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
