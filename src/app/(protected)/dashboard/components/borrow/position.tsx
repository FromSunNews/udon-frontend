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
import { UserAccountData, UserReserveData } from '../../types';
import { useRouter } from 'next/navigation';
import CountUp from '@/components/common/count-up';

interface BorrowPositionTableProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  yourBorrowBalancePosition: number;
  yourBorrowPowerUsagePosition: number;
  yourBorrowAPYPosition: number;
  enableBorrow: boolean;
  accountData: UserAccountData;
}

export const BorrowPositionTable: React.FC<BorrowPositionTableProps> = ({
  positions,
  isLoading,
  mutateAssets,
  yourBorrowBalancePosition,
  yourBorrowPowerUsagePosition,
  yourBorrowAPYPosition,
  enableBorrow,
  accountData,
}) => {
  const router = useRouter();
  // Dialog state management
  const [selectedPosition, setSelectedPosition] = useState<UserReserveData | null>(null);
  const [repayDialogOpen, setRepayDialogOpen] = useState(false);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  console.log('enableBorrow in position', enableBorrow);
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

  // Handle asset click
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  // Render reserve. icon and symbol
  const renderAssetCell = (reserve: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleAssetClick(reserve.assetId.toString('hex'))}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium">{reserve.symbol}</Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
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
        if (row.currentVariableDebt === 0) {
          return <Typography>_</Typography>;
        } else {
          return (
            <div className="flex flex-col gap-2">
              <CountUp value={row.currentVariableDebt} className="text-base" />
              <CountUp
                value={row.price * row.currentVariableDebt}
                prefix="$"
                decimals={2}
                className="text-sm text-submerged"
              />
            </div>
          );
        }
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
      accessorKey: 'borrowAPY',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.borrowAPY === 0) {
          return <Typography>_</Typography>;
        } else {
          return <CountUp value={row.borrowAPY} suffix="%" className="text-base" decimals={2} />;
        }
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
            <Button
              variant="gradient"
              className="w-[100px]"
              onClick={() => handleBorrowClick(row)}
              disabled={!enableBorrow || row.availableLiquidity == 0}
            >
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
            className="bg-transparent border-none"
            isLoading={true}
          />
        </div>
      ) : (
        <>
          {positions.length > 0 ? (
            <>
              <div className="flex gap-3 mb-4 flex-wrap">
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">Balance:</Typography>
                  {yourBorrowBalancePosition ? (
                    <CountUp
                      value={yourBorrowBalancePosition}
                      prefix="$"
                      className="text-base ml-1"
                    />
                  ) : (
                    <Typography>_</Typography>
                  )}
                </Badge>
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">APY:</Typography>
                  {yourBorrowAPYPosition ? (
                    <CountUp
                      value={yourBorrowAPYPosition}
                      suffix="%"
                      className="text-base ml-1"
                      decimals={2}
                    />
                  ) : (
                    <Typography>_</Typography>
                  )}
                </Badge>
                <Badge variant="outline" className="text-base px-3 gap-1">
                  <Typography weight="medium">Power Usage:</Typography>
                  {yourBorrowPowerUsagePosition ? (
                    <CountUp value={yourBorrowPowerUsagePosition} className="text-base ml-1" />
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
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}

      {/* Borrow Dialog */}
      {selectedPosition && borrowDialogOpen && (
        <BorrowDialog
          open={borrowDialogOpen}
          onOpenChange={setBorrowDialogOpen}
          reserve={selectedPosition}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}
    </div>
  );
};
