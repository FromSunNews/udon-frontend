'use client';

import React, { useState } from 'react';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ColumnDef, SortableTable } from '@/components/common/sortable-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { SupplyDialog } from './supply-dialog';
import { CommonAsset } from '../../types';

interface SupplyTableProps {
  title: string;
  showCollateral?: boolean;
  assets: CommonAsset[];
  isLoading: boolean;
  mutateAssets: () => void;
}

export const SupplyTable: React.FC<SupplyTableProps> = ({
  title,
  showCollateral = false,
  assets,
  isLoading,
  mutateAssets,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<CommonAsset | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Prepare assets with supply-specific properties
  const supplyAssets = assets.map(asset => ({
    ...asset,
    balance: asset.balance || '0',
    supplyAPY: 0.24, // TODO: calculate apy
    maxAmount: asset.balance,
    collateral: !!asset.canBeCollateral,
  }));

  // Handle supply button click
  const handleSupplyClick = (asset: CommonAsset) => {
    console.log('asset', asset);
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  // Handle asset click (navigation)
  const handleAssetClick = (asset: string) => {
    router.push(`/vault/${asset}`);
  };

  // Render asset icon and symbol
  const renderAssetCell = (asset: CommonAsset) => {
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

  // Define columns for the supply table
  const supplyColumns: ColumnDef<CommonAsset>[] = [
    {
      header: 'Assets',
      accessorKey: 'symbol',
      enableSorting: true,
      cell: ({ row }: { row: CommonAsset }) => renderAssetCell(row),
    },
    {
      header: 'Wallet Balance',
      accessorKey: 'balance',
      enableSorting: true,
      cell: ({ row }: { row: CommonAsset }) => <Typography>{row.balance}</Typography>,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      enableSorting: true,
      cell: ({ row }: { row: CommonAsset }) => (
        <Typography>${row.price != null ? row.price.toFixed(2) : '—'}</Typography>
      ),
    },
    {
      header: 'APY',
      accessorKey: 'supplyAPY',
      enableSorting: true,
      cell: ({ row }: { row: CommonAsset }) => <Typography>{row.supplyAPY}</Typography>,
    },
    {
      header: 'Collateral',
      accessorKey: 'canBeCollateral',
      enableSorting: true,
      cell: ({ row }: { row: CommonAsset }) => (
        <Typography
          className={row.canBeCollateral ? 'text-green-500' : 'text-red-500'}
          weight={row.canBeCollateral ? 'semibold' : 'normal'}
        >
          {row.canBeCollateral ? 'Yes' : 'No'}
        </Typography>
        //show check icon if true, otherwise show cross icon
        // <div className="flex items-center gap-2">
        //   {row.canBeCollateral ? (
        //     <CheckIcon className="w-6 h-6 text-green-500" />
        //   ) : (
        //     <XIcon className="w-6 h-6 text-red-500" />
        //   )}
        // </div>
      ),
    },
    ...(showCollateral
      ? [
          {
            header: 'Collateral',
            accessorKey: 'canBeCollateral',
            enableSorting: false,
            cell: () => (
              <div className="flex flex-col items-center">
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="70" height="19" viewBox="0 0 70 19" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 19px"> <circle cx="9" cy="9.5" r="9" fill="hsl(var(--muted))"></circle> <circle cx="22" cy="9.5" r="9" fill="hsl(var(--muted)/0.8)"></circle> <circle cx="35" cy="9.5" r="9" fill="hsl(var(--muted)/0.6)"></circle> <circle cx="48" cy="9.5" r="9" fill="hsl(var(--muted)/0.4)"></circle> <circle cx="61" cy="9.5" r="9" fill="hsl(var(--muted)/0.2)"></circle> </svg>`,
                  }}
                  className="mx-auto text-muted-foreground"
                />
                <Typography variant="small">+4</Typography>
              </div>
            ),
          } as ColumnDef<CommonAsset>,
        ]
      : []),
    {
      header: '',
      accessorKey: 'symbol',
      enableSorting: false,
      cell: ({ row }: { row: CommonAsset }) => (
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

        {(!supplyAssets || supplyAssets.length === 0) && !isLoading && (
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
          ) : supplyAssets.length > 0 ? (
            <SortableTable<CommonAsset>
              data={supplyAssets}
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
          asset={selectedAsset}
          mutateAssets={mutateAssets}
        />
      )}
    </>
  );
};
