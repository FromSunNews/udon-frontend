import React from 'react';
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
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('hourly');

  const { data, isLoading, error } = useAPYHistory(reserve.assetId, timePeriod, chartType);

  // Calculate average APY if available
  const avgValue = React.useMemo(() => {
    if (!data || data.length === 0)
      return chartType === 'deposit' ? reserve.supplyAPY : reserve.borrowAPY;

    const sum = data.reduce((acc, item) => acc + item.value, 0);
    return sum / data.length;
  }, [data, chartType, reserve.supplyAPY, reserve.borrowAPY]);

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
              tooltipFormatter={value => [`${value.toFixed(2)}%`, 'APY']}
              showAvg={true}
              avgValue={avgValue}
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
