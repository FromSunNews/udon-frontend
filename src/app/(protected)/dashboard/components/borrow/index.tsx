'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { useRouter } from 'next/navigation';
import { ColumnDef, SortableTable } from '@/components/common/sortable-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { BorrowDialog } from './borrow-dialog';
import { UserAccountData, UserReserveData } from '../../types';
import { Skeleton } from '@/components/common/skeleton';
import CountUp from '@/components/common/count-up';

// Define type for borrow reserves

interface BorrowTableProps {
  title: string;
  reserves: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  enableBorrow: boolean;
  accountData: UserAccountData;
}

export const BorrowTable: React.FC<BorrowTableProps> = ({
  title,
  reserves,
  isLoading,
  mutateAssets,
  enableBorrow,
  accountData,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<UserReserveData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  // Handle borrow button click
  const handleBorrowClick = (asset: UserReserveData) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  // Handle asset click
  const handleAssetClick = (asset: string) => {
    router.push(`/reserve/${asset}`);
  };

  // Render asset icon and symbol
  const renderAssetCell = (asset: UserReserveData) => {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleAssetClick(asset.assetId.toString('hex'))}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={asset.iconUrl} alt={asset.symbol} />
                <AvatarFallback>{asset.symbol.charAt(0)}</AvatarFallback>
              </Avatar>
              <Typography weight="medium">{asset.symbol}</Typography>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{asset.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Define columns for the borrow table
  const borrowColumns: ColumnDef<UserReserveData>[] = [
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
      header: 'Available',
      accessorKey: 'availableLiquidity',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.availableLiquidity === 0) {
          return <Typography>_</Typography>;
        } else {
          return (
            <div className="flex flex-col gap-2">
              <CountUp value={row.availableLiquidity} className="text-base" />
              <CountUp
                value={row.price * row.availableLiquidity}
                prefix="$"
                decimals={2}
                className="text-sm text-submerged"
              />
            </div>
          );
        }
      },
      meta: {
        skeleton: <Skeleton className="w-20 h-5" />,
      },
    },
    {
      header: 'Price',
      accessorKey: 'price',
      enableSorting: true,
      cell: ({ row }) => <CountUp value={row.price} prefix="$" className="text-base" />,
      meta: {
        skeleton: <Skeleton className="w-16 h-5" />,
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
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <div className="flex flex-col gap-2">
            <Button
              variant="gradient"
              onClick={e => {
                e.stopPropagation();
                handleBorrowClick(row);
              }}
              aria-label={`Borrow ${row.symbol}`}
              className="w-[100px]"
              disabled={!enableBorrow || row.availableLiquidity == 0}
            >
              Borrow
            </Button>

            <Button
              variant="outlineGradient"
              onClick={() => handleAssetClick(row.assetId.toString('hex'))}
              aria-label={`Borrow ${row.symbol}`}
              className="w-[100px]"
            >
              Details
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
    <>
      <div className="flex-1 border bg-card p-3 sm:p-5 rounded-[18px] border-solid border-border min-w-[320px] max-w-full">
        <div className="flex justify-between items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <Typography variant="h4" weight="semibold" className="mb-4 text-2xl">
              {title}
            </Typography>
          )}
        </div>

        {(!reserves || reserves.length === 0) && !isLoading && (
          <div className="flex flex-grow items-center justify-center">
            <Typography className="text-submerged text-center text-lg">
              No reserves available for borrowing at this time.
            </Typography>
          </div>
        )}

        <div className="mt-3 sm:mt-5">
          <SortableTable<UserReserveData>
            data={reserves}
            columns={borrowColumns}
            className="p-0 border-none"
            isLoading={isLoading}
          />
        </div>
      </div>

      {selectedAsset && dialogOpen && (
        <BorrowDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          reserve={selectedAsset}
          mutateAssets={mutateAssets}
          accountData={accountData}
        />
      )}
    </>
  );
};
