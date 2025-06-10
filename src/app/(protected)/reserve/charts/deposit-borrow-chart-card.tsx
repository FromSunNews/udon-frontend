import React, { useEffect } from 'react';
import { UserReserveData } from '../../dashboard/types';
import { ChartCard } from './chart-card';
import { ChartFilters } from './chart-filters';
import { ChartType, TimePeriod } from '../types';
import { SimpleAreaChart } from './simple-area';
import { useTotalDepositBorrowHistory } from '@/hooks/contracts/queries/use-total-deposit-borrow-chart';
import { Skeleton } from '@/components/common/skeleton';

interface DepositBorrowChartCardProps {
  reserve: UserReserveData;
}

export const DepositBorrowChartCard: React.FC<DepositBorrowChartCardProps> = ({ reserve }) => {
  const [chartType, setChartType] = React.useState<ChartType>('deposit');
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('24_hours');

  const { data, avgValue, isLoading, error } = useTotalDepositBorrowHistory(
    reserve.assetId,
    timePeriod,
    reserve.decimals,
    chartType
  );

  // Log for debugging
  useEffect(() => {
    console.log('DepositBorrowChartCard data:', {
      dataLength: data?.length,
      avgValue,
      isLoading,
      hasError: !!error,
    });
  }, [data, avgValue, isLoading, error]);

  return (
    <ChartCard
      title={
        chartType === 'deposit'
          ? `Total Deposit (${reserve.symbol})`
          : `Total Borrow (${reserve.symbol})`
      }
      value={
        chartType === 'deposit'
          ? reserve.currentATokenTotalSupply
          : reserve.currentVariableDebtTokenTotalSupply
      }
      filters={
        <ChartFilters
          chartType={chartType}
          setChartType={setChartType}
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
        />
      }
    >
      {isLoading ? (
        <div className="w-full h-full flex flex-1 items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      ) : error ? (
        <div className="w-full h-64 flex items-center justify-center text-red-500">
          Failed to load chart data
        </div>
      ) : (
        <SimpleAreaChart
          data={data || []}
          tooltipFormatter={value =>
            chartType === 'deposit'
              ? [`Total Deposit: ${value.toFixed(2)}`]
              : [`Total Borrow: ${value.toFixed(2)}`]
          }
          showAvg={true}
          avgValue={avgValue}
          period={timePeriod}
        />
      )}
    </ChartCard>
  );
};
