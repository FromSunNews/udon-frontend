'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { useRouter } from 'next/navigation';
import { CheckIcon, Loader2, XIcon } from 'lucide-react';
import { ColumnDef, SortableTable } from '@/components/common/sortable-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { SupplyDialog } from './supply-dialog';
import { UserReserveData } from '../../types';

interface SupplyTableProps {
  title: string;
  reserves: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
}

export const SupplyTable: React.FC<SupplyTableProps> = ({
  title,
  reserves,
  isLoading,
  mutateAssets,
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
  const handleAssetClick = (asset: string) => {
    router.push(`/vault/${asset}`);
  };

  // Render asset icon and symbol
  const renderAssetCell = (asset: UserReserveData) => {
    console.log('asset', asset);
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

  // Define columns for the supply table
  const supplyColumns: ColumnDef<UserReserveData>[] = [
    {
      header: 'Assets',
      accessorKey: 'symbol',
      enableSorting: true,
      cell: ({ row }: { row: UserReserveData }) => renderAssetCell(row),
    },
    {
      header: 'Wallet Balance',
      accessorKey: 'balance',
      enableSorting: true,
      cell: ({ row }: { row: UserReserveData }) => <Typography>{row.balance}</Typography>,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      enableSorting: true,
      cell: ({ row }: { row: UserReserveData }) => (
        <Typography>${row.price != null ? row.price.toFixed(2) : '—'}</Typography>
      ),
    },
    {
      header: 'APY',
      accessorKey: 'supplyAPY',
      enableSorting: true,
      cell: ({ row }: { row: UserReserveData }) => (
        <Typography>{row.supplyAPY.toFixed(4)}%</Typography>
      ),
    },
    {
      header: 'Collateral',
      accessorKey: 'usageAsCollateralEnabled',
      enableSorting: true,
      cell: ({ row }: { row: UserReserveData }) => (
        // <Typography
        //   className={row.canBeCollateral ? 'text-green-500' : 'text-red-500'}
        //   weight={row.canBeCollateral ? 'semibold' : 'normal'}
        // >
        //   {row.canBeCollateral ? 'Yes' : 'No'}
        // </Typography>
        //show check icon if true, otherwise show cross icon
        <div className="flex items-center gap-2">
          {row.usageAsCollateralEnabled ? (
            <CheckIcon className="w-6 h-6 text-green-500" />
          ) : (
            <XIcon className="w-6 h-6 text-red-500" />
          )}
        </div>
      ),
    },
    {
      header: '',
      accessorKey: 'symbol',
      enableSorting: false,
      cell: ({ row }: { row: UserReserveData }) => (
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
            >
              Supply
            </Button>

            <Button
              variant="outlineGradient"
              onClick={() => handleAssetClick(row.symbol)}
              aria-label={`Borrow ${row.symbol}`}
              className="w-[100px]"
            >
              Details
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex-1 border bg-card p-3 sm:p-5 rounded-[18px] border-solid border-border min-w-[320px] max-w-full">
        <div className="flex justify-between items-center">
          <Typography variant="h4" weight="semibold" className="mb-4 text-2xl">
            {title}
          </Typography>
        </div>

        {(!reserves || reserves.length === 0) && !isLoading && (
          <div className="rounded bg-accent/30 mt-2 sm:mt-2.5 p-2 sm:p-2.5">
            <Typography variant="small" color="submerged">
              Assets are not available for supply at this time.
            </Typography>
          </div>
        )}

        <div className="mt-3 sm:mt-5">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reserves.length > 0 ? (
            <SortableTable<UserReserveData>
              data={reserves}
              columns={supplyColumns}
              pageSize={5}
              className="p-0 border-none"
            />
          ) : null}
        </div>
      </div>

      {/* re-render when close or click outside dialog */}
      {selectedAsset && dialogOpen && (
        <SupplyDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          reserve={selectedAsset}
          mutateAssets={mutateAssets}
        />
      )}
    </>
  );
};
