import React, { useEffect } from 'react';
import { UserReserveData } from '../../dashboard/types';
import { ChartCard } from './chart-card';
import { ChartFilters } from './chart-filters';
import { ChartType, TimePeriod } from '../types';
import { SimpleAreaChart } from './simple-area';
import { useAPYHistory } from '@/hooks/contracts/queries/use-apy-chart';
import { Skeleton } from '@/components/common/skeleton';

interface APYChartCardProps {
  reserve: UserReserveData;
}

export const APYChartCard: React.FC<APYChartCardProps> = ({ reserve }) => {
  const [chartType, setChartType] = React.useState<ChartType>('deposit');
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('24_hours');

  const { data, avgValue, isLoading, error } = useAPYHistory(
    reserve.assetId,
    timePeriod,
    chartType
  );

  // Log for debugging
  useEffect(() => {
    console.log('APYChartCard data:', {
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
          title={chartType === 'deposit' ? 'Deposit APY' : 'Borrow APY'}
          value={chartType === 'deposit' ? reserve.supplyAPY : reserve.borrowAPY}
          suffix="%"
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
            <div className="w-full h-full flex items-center justify-center text-red-500">
              Failed to load APY data
            </div>
          ) : (
            <SimpleAreaChart
              data={data || []}
              tooltipFormatter={value => [`APY: ${value.toFixed(2)}%`]}
              showAvg={true}
              avgValue={avgValue}
              period={timePeriod}
            />
          )}
        </ChartCard>
      </div>
      {/* <div className="w-full md:w-1/3 flex items-start"> */}
      {/* <APYBreakdownList items={apyBreakdown} /> */}
      {/* </div> */}
    </div>
  );
};
