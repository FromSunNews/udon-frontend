import { ChartType, TimePeriod } from '@/app/(protected)/reserve/types';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { normalizeBN } from '@/utils/bignumber';
import { useQuery } from '@tanstack/react-query';

export type ChartDataPoint = {
  date: string;
  value: number;
};

export function useTotalDepositBorrowHistory(
  assetId: Buffer<ArrayBufferLike>,
  periodType: TimePeriod = 'hourly',
  decimals: number,
  chartType: ChartType
) {
  const { client } = useChromiaAccount();

  const query = useQuery({
    queryKey: ['total_deposit_borrow_history', assetId, periodType, chartType],
    queryFn: async () => {
      if (!client) return null;

      // Select endpoint based on chart type
      const endpoint =
        chartType === 'deposit' ? 'get_total_deposit_history' : 'get_total_borrow_history';

      const result = await client.query(endpoint, {
        asset_id: assetId,
        period_type: periodType,
      });

      if (!result) return null;

      // Parse the result - it's now an array of [timestamp, totalDeposit] arrays
      const dataArray = JSON.parse(result as string) as [number, number][];

      console.log('dataArray', dataArray);

      // Convert to chart data format with proper date formatting
      const chartData = dataArray.map(item => {
        const timestamp = item[0]; // First element is timestamp
        const totalSupply = Number(normalizeBN(item[1].toString(), decimals)); // Second element is totalDeposit
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
          value: totalSupply,
        } as ChartDataPoint;
      });

      console.log('chartData', chartData);

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
