'use client';

import React from 'react';
// import { Typography } from '@/components/common/typography';
import { UserReserveData } from '@/app/(protected)/dashboard/types';
// import { marketData } from '@/app/(protected)/reserve/data/mock-data';
// import { AllocationChart } from '@/app/(protected)/reserve/charts';
// import { SortableTable, type ColumnDef } from '@/components/common/sortable-table';
// import { ArrowUpRight } from 'lucide-react';
// import { cn } from '@/utils/tailwind';
import { DepositBorrowChartCard } from '../charts/deposit-borrow-chart-card';
import { APYChartCard } from '../charts/apy-chart-card';
import { BorrowRateChartCard } from '../charts/borrow-rate-chart-card';

// Market table indicator component
// const MarketIndicator = ({ active }: { active?: boolean }) => (
//   <span
//     className={cn(
//       'mr-3 inline-flex w-8 h-8 rounded-full border-[3.5px] transition bg-gradient-to-br',
//       active ? 'border-primary bg-primary/10' : 'border-border bg-muted/20'
//     )}
//   />
// );

// Define the type for market data
// interface MarketData {
//   id: number;
//   market: string;
//   alloc: number;
//   allocPct: number;
//   supply: number;
//   cap: number;
//   apy: number;
// }

interface VaultOverviewProps {
  reserve: UserReserveData;
}

// Main component
export const VaultOverview: React.FC<VaultOverviewProps> = ({ reserve }) => {
  console.log('reserve', reserve);

  // Helper function to render market allocation cell
  // const renderMarketCell = (item: MarketData | undefined) => {
  //   if (!item) return null;
  //   return (
  //     <div className="frow-icenter">
  //       <MarketIndicator active={item.id % 2 === 0} />
  //       <Typography weight="medium">{item.market}</Typography>
  //       <span className="bg-card text-xs px-2 py-0.5 ml-2 rounded-lg font-semibold text-muted-foreground">
  //         {item.alloc}%
  //       </span>
  //     </div>
  //   );
  // };

  // // Helper function to render allocation cell
  // const renderAllocationCell = (item: MarketData | undefined) => {
  //   if (!item) return null;
  //   return <AllocationChart percentage={item.allocPct} />;
  // };

  // // Helper function to render supply cell
  // const renderSupplyCell = (item: MarketData | undefined) => {
  //   if (!item) return null;
  //   return <Typography>${item.supply.toFixed(2)}M</Typography>;
  // };

  // // Helper function to render cap cell
  // const renderCapCell = (item: MarketData | undefined) => {
  //   if (!item) return null;
  //   return <Typography>${item.cap.toFixed(2)}M</Typography>;
  // };

  // // Helper function to render APY cell
  // const renderApyCell = (item: MarketData | undefined) => {
  //   if (!item) r eturn null;
  //   return (
  //     <Typography className="frow-icenter font-semibold">
  //       {item.apy.toFixed(2)}%
  //       <ArrowUpRight className="ml-1 h-4 w-4" />
  //     </Typography>
  //   );
  // };

  // Define columns for the table
  // const columns: ColumnDef<MarketData>[] = [
  //   {
  //     header: 'Market',
  //     accessorKey: 'market',
  //     enableSorting: true,
  //     cell: ({ row }) => renderMarketCell(row),
  //   },
  //   {
  //     header: 'Allocation',
  //     accessorKey: 'alloc',
  //     enableSorting: true,
  //     cell: ({ row }) => renderAllocationCell(row),
  //   },
  //   {
  //     header: 'Supply',
  //     accessorKey: 'supply',
  //     enableSorting: true,
  //     cell: ({ row }) => renderSupplyCell(row),
  //   },
  //   {
  //     header: 'Capacity',
  //     accessorKey: 'cap',
  //     enableSorting: true,
  //     cell: ({ row }) => renderCapCell(row),
  //   },
  //   {
  //     header: 'APY',
  //     accessorKey: 'apy',
  //     enableSorting: true,
  //     cell: ({ row }) => renderApyCell(row),
  //   },
  // ];

  return (
    <div className="fcol gap-6 w-full">
      {/* Deposits Chart Card */}
      <DepositBorrowChartCard reserve={reserve} />

      {/* APY Card + APY Breakdown */}
      <APYChartCard reserve={reserve} />

      {/* Borrow Rate Card */}
      <BorrowRateChartCard reserve={reserve} />

      {/* Market Allocation Table */}
      {/* <SortableTable data={marketData} columns={columns} pageSize={8} /> */}
    </div>
  );
};
