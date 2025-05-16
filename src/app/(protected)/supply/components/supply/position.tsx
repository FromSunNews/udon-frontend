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
import { CommonAsset } from '../../types';

interface UserReserveData {
  asset: CommonAsset;
  current_a_token_balance: number;
  current_variable_debt: number;
  scaled_variable_debt: number;
  liquidity_rate: number;
  usage_as_collateral_enabled: boolean;
}

interface SupplyPositionTableProps {
  positions: UserReserveData[];
  isLoading: boolean;
  mutateAssets: () => void;
}

export const SupplyPositionTable: React.FC<SupplyPositionTableProps> = ({
  positions,
  isLoading,
  mutateAssets,
}) => {
  // Dialog state management
  const [selectedPosition, setSelectedPosition] = useState<UserReserveData | null>(null);
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  // Handle supply button click for a position
  const handleSupplyClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setSupplyDialogOpen(true);
  };

  // Handle withdraw button click for a position
  const handleWithdrawClick = (position: UserReserveData) => {
    setSelectedPosition(position);
    setWithdrawDialogOpen(true);
  };

  // Calculate total supply balance in USD
  const totalBalanceUsd = positions.reduce((sum, position) => {
    const balance =
      Number(position.current_a_token_balance) / Math.pow(10, position.asset.decimals);
    return sum + balance * (position.asset.price || 0);
  }, 0);

  // Calculate average APY
  const averageApy =
    positions.length > 0
      ? positions.reduce((sum, position) => sum + Number(position.liquidity_rate) / 1e25, 0) /
        positions.length
      : 0;

  // Calculate total collateral in USD
  const totalCollateralUsd = positions
    .filter(position => position.usage_as_collateral_enabled)
    .reduce((sum, position) => {
      const balance =
        Number(position.current_a_token_balance) / Math.pow(10, position.asset.decimals);
      return sum + balance * (position.asset.price || 0);
    }, 0);

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

  // Define columns for the positions table
  const columns: ColumnDef<UserReserveData>[] = [
    {
      header: 'Assets',
      accessorKey: 'asset',
      cell: ({ row }) => renderAssetCell(row.asset),
    },
    {
      header: 'Amount',
      accessorKey: 'current_a_token_balance',
      cell: ({ row }) => {
        const asset = row.asset;
        const balance = row.current_a_token_balance;
        const balanceUsd = Number(balance) * (asset.price || 0);
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
      accessorKey: 'liquidity_rate',
      cell: ({ row }) => {
        const apy = Number(row.liquidity_rate) / 1e25; // Adjust based on how apy is stored
        return <Typography weight="medium">{apy.toFixed(2)}%</Typography>;
      },
    },
    {
      header: 'Collateral',
      accessorKey: 'usage_as_collateral_enabled',
      cell: ({ row }) => (
        <Switch
          checked={row.usage_as_collateral_enabled}
          onCheckedChange={() => {
            console.log('checked', row.usage_as_collateral_enabled);
          }}
        />
      ),
    },
    {
      header: '',
      accessorKey: 'asset',
      cell: ({ row }) => {
        // Get the full position object from the row
        const position = positions.find(
          p => Buffer.compare(p.asset.id, (row.asset as CommonAsset).id) === 0
        );

        if (!position) return null;

        return (
          <div className="flex justify-end">
            <div className="flex flex-col gap-2">
              <Button
                variant="gradient"
                className="w-[100px]"
                onClick={() => handleSupplyClick(position)}
              >
                Supply
              </Button>
              <Button
                variant="outlineGradient"
                className="w-[100px]"
                onClick={() => handleWithdrawClick(position)}
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
                  Balance: ${totalBalanceUsd.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  APY: {averageApy.toFixed(2)}%
                </Badge>
                <Badge variant="outline" className="text-base px-3">
                  Collateral: ${totalCollateralUsd.toFixed(2)}
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
          asset={selectedPosition.asset}
          mutateAssets={mutateAssets}
        />
      )}

      {/* Withdraw Dialog */}
      {selectedPosition && withdrawDialogOpen && (
        <WithdrawDialog
          open={withdrawDialogOpen}
          onOpenChange={setWithdrawDialogOpen}
          asset={selectedPosition.asset}
          supplyBalance={(
            Number(selectedPosition.current_a_token_balance) /
            Math.pow(10, selectedPosition.asset.decimals)
          ).toFixed(2)}
          healthFactor={1.23} // This would be calculated based on user's positions
          mutateAssets={mutateAssets}
        />
      )}
    </div>
  );
};
