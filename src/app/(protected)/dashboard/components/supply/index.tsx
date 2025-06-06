'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { useRouter } from 'next/navigation';
import { CheckIcon, XIcon } from 'lucide-react';
import { ColumnDef, SortableTable } from '@/components/common/sortable-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { SupplyDialog } from './supply-dialog';
import { UserAccountData, UserReserveData } from '../../types';
import { Skeleton } from '@/components/common/skeleton';
import { FaucetTestBadge } from '../faucet-badge';
import CountUp from '@/components/common/count-up';

interface SupplyTableProps {
  title: string;
  reserves: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
  accountData: UserAccountData;
}

export const SupplyTable: React.FC<SupplyTableProps> = ({
  title,
  reserves,
  isLoading,
  mutateAssets,
  accountData,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<UserReserveData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Handle supply button click
  const handleSupplyClick = (reserve: UserReserveData) => {
    console.log('reserve', reserve);
    setSelectedAsset(reserve);
    setDialogOpen(true);
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
          <TooltipContent>
            <p>{asset.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Define columns for the supply table
  const supplyColumns: ColumnDef<UserReserveData>[] = [
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
      header: 'Balance',
      accessorKey: 'balance',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.balance === 0) {
          return <Typography>_</Typography>;
        } else {
          return (
            <div className="flex flex-col gap-2">
              <CountUp value={row.balance} className="text-base" />
              <CountUp
                value={row.price * row.balance}
                prefix="$"
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
      accessorKey: 'supplyAPY',
      enableSorting: true,
      cell: ({ row }) => {
        if (row.supplyAPY === 0) {
          return <Typography>_</Typography>;
        } else {
          return (
            <div className="flex flex-col gap-2">
              <CountUp value={row.supplyAPY} suffix="%" className="text-base" decimals={4} />
            </div>
          );
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
        <div className="flex items-center gap-2">
          {row.usageAsCollateralEnabled ? (
            <CheckIcon className="w-6 h-6 text-green-500" />
          ) : (
            <XIcon className="w-6 h-6 text-red-500" />
          )}
        </div>
      ),
      meta: {
        skeleton: <Skeleton className="w-6 h-6 rounded-full" />,
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
                handleSupplyClick(row);
              }}
              aria-label={`Supply ${row.symbol}`}
              className="w-[100px]"
              disabled={row.balance === 0}
            >
              Supply
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
        <div className="flex justify-between items-center mb-4">
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <Typography variant="h4" weight="semibold" className="text-2xl">
                {title}
              </Typography>
            )}
          </div>

          <div>
            <FaucetTestBadge isLoading={isLoading} />
          </div>
        </div>

        {(!reserves || reserves.length === 0) && !isLoading && (
          <div className="flex flex-grow items-center justify-center">
            <Typography className="text-submerged text-center text-lg">
              Assets are not available for supply at this time.
            </Typography>
          </div>
        )}
        <div className="mt-3 sm:mt-5">
          <SortableTable<UserReserveData>
            data={reserves}
            columns={supplyColumns}
            className="p-0 border-none"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* re-render when close or click outside dialog */}
      {selectedAsset && dialogOpen && (
        <SupplyDialog
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
