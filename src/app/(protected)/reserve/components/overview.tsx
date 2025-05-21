'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/common/typography';
import {
  depositsData,
  apyData,
  apyBreakdown,
  marketData,
} from '@/app/(protected)/reserve/data/mock-data';
import {
  SimpleAreaChart,
  ChartFilters,
  ChartCard,
  APYBreakdownList,
  AllocationChart,
} from '@/app/(protected)/reserve/charts';
import { SortableTable, type ColumnDef } from '@/components/common/sortable-table';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/tailwind';

// Market table indicator component
const MarketIndicator = ({ active }: { active?: boolean }) => (
  <span
    className={cn(
      'mr-3 inline-flex w-8 h-8 rounded-full border-[3.5px] transition bg-gradient-to-br',
      active ? 'border-primary bg-primary/10' : 'border-border bg-muted/20'
    )}
  />
);

// Define the type for market data
interface MarketData {
  id: number;
  market: string;
  alloc: number;
  allocPct: number;
  supply: number;
  cap: number;
  apy: number;
}

// Main component
export const VaultOverview: React.FC = () => {
  // Chart filter states
  const [depositChartType, setDepositChartType] = useState<'deposit' | 'liquidity'>('deposit');
  const [depositCurrency, setDepositCurrency] = useState<'usdc' | 'usdt'>('usdc');
  const [depositTimePeriod, setDepositTimePeriod] = useState('3 months');

  const [apyTimePeriod, setApyTimePeriod] = useState('3 months');

  // Helper function to render market allocation cell
  const renderMarketCell = (item: MarketData | undefined) => {
    if (!item) return null;
    return (
      <div className="frow-icenter">
        <MarketIndicator active={item.id % 2 === 0} />
        <Typography weight="medium">{item.market}</Typography>
        <span className="bg-card text-xs px-2 py-0.5 ml-2 rounded-lg font-semibold text-muted-foreground">
          {item.alloc}%
        </span>
      </div>
    );
  };

  // Helper function to render allocation cell
  const renderAllocationCell = (item: MarketData | undefined) => {
    if (!item) return null;
    return <AllocationChart percentage={item.allocPct} />;
  };

  // Helper function to render supply cell
  const renderSupplyCell = (item: MarketData | undefined) => {
    if (!item) return null;
    return <Typography>${item.supply.toFixed(2)}M</Typography>;
  };

  // Helper function to render cap cell
  const renderCapCell = (item: MarketData | undefined) => {
    if (!item) return null;
    return <Typography>${item.cap.toFixed(2)}M</Typography>;
  };

  // Helper function to render APY cell
  const renderApyCell = (item: MarketData | undefined) => {
    if (!item) return null;
    return (
      <Typography className="frow-icenter font-semibold">
        {item.apy.toFixed(2)}%
        <ArrowUpRight className="ml-1 h-4 w-4" />
      </Typography>
    );
  };

  // Define columns for the table
  const columns: ColumnDef<MarketData>[] = [
    {
      header: 'Market',
      accessorKey: 'market',
      enableSorting: true,
      cell: ({ row }) => renderMarketCell(row),
    },
    {
      header: 'Allocation',
      accessorKey: 'alloc',
      enableSorting: true,
      cell: ({ row }) => renderAllocationCell(row),
    },
    {
      header: 'Supply',
      accessorKey: 'supply',
      enableSorting: true,
      cell: ({ row }) => renderSupplyCell(row),
    },
    {
      header: 'Capacity',
      accessorKey: 'cap',
      enableSorting: true,
      cell: ({ row }) => renderCapCell(row),
    },
    {
      header: 'APY',
      accessorKey: 'apy',
      enableSorting: true,
      cell: ({ row }) => renderApyCell(row),
    },
  ];

  return (
    <div className="fcol gap-6 w-full">
      {/* Deposits Chart Card */}
      <ChartCard
        title="Total Deposits (USD)"
        value="197.45"
        valueSuffix="M"
        filters={
          <ChartFilters
            chartType={depositChartType}
            setChartType={setDepositChartType}
            currency={depositCurrency}
            setCurrency={setDepositCurrency}
            timePeriod={depositTimePeriod}
            setTimePeriod={setDepositTimePeriod}
          />
        }
      >
        <SimpleAreaChart
          data={depositsData}
          tooltipFormatter={value => [`$${value}M`, 'Deposits']}
        />
      </ChartCard>

      {/* APY Card + APY Breakdown */}
      <div className="fcol md:frow gap-6 w-full">
        <div className="w-full md:w-2/3">
          <ChartCard
            title="APY"
            value="7.77"
            valueSuffix="%"
            filters={
              <ChartFilters
                chartType={depositChartType}
                setChartType={setDepositChartType}
                currency={depositCurrency}
                setCurrency={setDepositCurrency}
                timePeriod={apyTimePeriod}
                setTimePeriod={setApyTimePeriod}
                timeOptions={['1 month', '3 months', '6 months', '1 year']}
              />
            }
          >
            <SimpleAreaChart
              data={apyData}
              tooltipFormatter={value => [`${value}%`, 'APY']}
              showAvg={true}
              avgValue={7.77}
            />
          </ChartCard>
        </div>
        <div className="w-full md:w-1/3 flex items-start">
          <APYBreakdownList items={apyBreakdown} />
        </div>
      </div>

      {/* Market Allocation Table */}
      <SortableTable data={marketData} columns={columns} pageSize={8} />
    </div>
  );
};
