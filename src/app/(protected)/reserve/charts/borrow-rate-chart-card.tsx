import React, { useEffect } from 'react';
import { UserReserveData } from '../../dashboard/types';
import { ChartCard } from './chart-card';
import { ChartFilters } from './chart-filters';
import { ChartType, TimePeriod } from '../types';
import { SimpleAreaChart } from './simple-area';
import { useBorrowRateHistory } from '@/hooks/contracts/queries/use-borrow-rate-chart';
import { Skeleton } from '@/components/common/skeleton';
import { useStatsSupplyDeposit } from '@/hooks/contracts/queries/use-stats-supply-deposit';

interface BorrowRateChartCardProps {
  reserve: UserReserveData;
}

export const BorrowRateChartCard: React.FC<BorrowRateChartCardProps> = ({ reserve }) => {
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('24_hours');

  // Fixed chartType for this component
  const chartType: ChartType = 'borrow';
  const setChartType = () => {}; // No-op function as we don't need to change chart type

  const { data, avgValue, isLoading, error } = useBorrowRateHistory(reserve.assetId, timePeriod);

  const {
    totalValueDeposited,
    totalValueBorrowed,
    isLoading: isStatSupplyDepositFetching,
  } = useStatsSupplyDeposit();

  // Log for debugging
  useEffect(() => {
    console.log('BorrowRateChartCard data:', {
      dataLength: data?.length,
      avgValue,
      isLoading,
      hasError: !!error,
    });
  }, [data, avgValue, isLoading, error]);

  return (
    <div className="fcol md:frow gap-6 w-full">
      <div className="w-full">
        <ChartCard
          title="Borrow Rate"
          value={(totalValueBorrowed * 100) / totalValueDeposited}
          suffix="%"
          filters={
            <ChartFilters
              chartType={chartType}
              setChartType={setChartType}
              timePeriod={timePeriod}
              setTimePeriod={setTimePeriod}
              isShowChartType={false}
            />
          }
        >
          {isLoading || isStatSupplyDepositFetching ? (
            <div className="w-full h-full flex flex-1 items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-red-500">
              Failed to load borrow rate data
            </div>
          ) : (
            <SimpleAreaChart
              data={data || []}
              tooltipFormatter={value => [`Borrow Rate: ${value.toFixed(2)}%`]}
              showAvg={true}
              avgValue={avgValue}
              period={timePeriod}
            />
          )}
        </ChartCard>
      </div>
    </div>
  );
};
