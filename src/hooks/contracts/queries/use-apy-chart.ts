import { ChartType, TimePeriod } from '@/app/(protected)/reserve/types';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { normalizeBN } from '@/utils/bignumber';
// import { formatRay } from '@/utils/wadraymath';
import { useQuery } from '@tanstack/react-query';

export type ChartDataPoint = {
  date: string;
  value: number;
};

export function useAPYHistory(
  assetId: Buffer<ArrayBufferLike>,
  periodType: TimePeriod = 'hourly',
  chartType: ChartType
) {
  const { client } = useChromiaAccount();

  const query = useQuery({
    queryKey: ['apy_history', assetId, periodType, chartType],
    queryFn: async () => {
      if (!client) return null;

      // Select endpoint based on chart type
      const endpoint =
        chartType === 'deposit' ? 'get_apy_deposit_history' : 'get_apy_borrow_history';

      const result = await client.query(endpoint, {
        asset_id: assetId,
        period_type: periodType,
      });

      console.log('result', result);

      if (!result) return null;

      // Parse the result - assuming it's now an array of [timestamp, apyValue] arrays
      const dataArray = JSON.parse(result as string) as [number, bigint][];
      console.log('dataArray', dataArray);
      // Convert to chart data format with proper date formatting
      const chartData = dataArray.map(item => {
        const timestamp = item[0]; // First element is timestamp
        console.log('item', item);
        const apyValue = Number(normalizeBN(item[1].toString(), 27)); // Second element is APY value

        console.log('apyValue', apyValue);
        const date = new Date(timestamp * 1000);
        let formattedDate = '';

        switch (periodType) {
          case 'hourly':
            formattedDate = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            break;
          case 'daily':
            formattedDate = date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
            });
            break;
          case 'weekly':
            // Calculate week number within the month
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const weekNumber = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
            formattedDate = `Week ${weekNumber}, ${date.toLocaleDateString('en-US', { month: 'short' })}`;
            break;
          case 'monthly':
            formattedDate = date.toLocaleDateString('en-US', { month: 'long' });
            break;
          case 'yearly':
            formattedDate = date.getFullYear().toString();
            break;
          default:
            formattedDate = date.toLocaleDateString();
        }

        return {
          date: formattedDate,
          value: apyValue * 100, // Convert to percentage
        } as ChartDataPoint;
      });

      return chartData;
    },
    enabled: !!client && !!assetId,
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
