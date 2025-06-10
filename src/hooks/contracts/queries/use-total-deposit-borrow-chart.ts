import { ChartType, TimePeriod } from '@/app/(protected)/reserve/types';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { normalizeBN } from '@/utils/bignumber';
import { useQuery } from '@tanstack/react-query';

export type ChartDataPoint = {
  date: string;
  value: number;
  tooltipDate?: string;
};

// Helper function to format date as DD/MM/YY
const formatShortDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
  return `${day}/${month}/${year}`;
};

export function useTotalDepositBorrowHistory(
  assetId: Buffer<ArrayBufferLike>,
  periodType: TimePeriod = '24_hours',
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
        let tooltipDate = '';

        switch (periodType) {
          case '24_hours': {
            // X-axis format: Just the time "5:00 PM", "2:30 AM"
            formattedDate = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            // Tooltip format: "5:00 PM 9/6/25"
            const shortDate = formatShortDate(date);
            tooltipDate = `${formattedDate} ${shortDate}`;
            break;
          }
          case '7_days': {
            // X-axis format: "DD/MM/YY"
            formattedDate = formatShortDate(date);

            // Tooltip format: "10:00PM DD/MM/YY"
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
            tooltipDate = `${timeStr} ${formattedDate}`;
            break;
          }
          case '30_days': {
            // Calculate week number within the month
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const weekNumber = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
            formattedDate = `Week ${weekNumber}, ${date.toLocaleDateString('en-US', { month: 'short' })}`;
            tooltipDate = date.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: '2-digit',
            });
            break;
          }
          case '90_days':
            formattedDate = date.toLocaleDateString('en-US', { month: 'long' });
            tooltipDate = date.toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: '2-digit',
            });
            break;
          case 'all_time':
            formattedDate = date.getFullYear().toString();
            tooltipDate = date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            });
            break;
          default:
            formattedDate = date.toLocaleDateString();
            tooltipDate = formattedDate;
        }

        return {
          date: formattedDate,
          value: totalSupply,
          tooltipDate,
        } as ChartDataPoint;
      });

      console.log('chartData', chartData);

      // Calculate average value
      let avgValue = 0;
      if (chartData.length > 0) {
        const sum = chartData.reduce((acc, item) => acc + item.value, 0);
        avgValue = Number((sum / chartData.length).toFixed(2));
      }

      // For 7_days period, we want to group by date and only show unique dates on x-axis
      if (periodType === '7_days') {
        // Get all unique dates from the data
        const uniqueDates = new Set<string>();
        chartData.forEach(item => {
          if (item.date) uniqueDates.add(item.date);
        });

        // For each unique date, find the first data point with that date
        // This ensures we have exactly one data point with a non-empty date string for each unique date
        const processedData = [...chartData]; // Create a copy to avoid modifying the original

        // First pass: mark all dates for duplicate removal
        const dateOccurrences = new Map<string, number>();
        processedData.forEach(item => {
          if (!item.date) return; // Skip empty dates

          const count = dateOccurrences.get(item.date) || 0;
          dateOccurrences.set(item.date, count + 1);

          // If this date appears more than once, mark subsequent occurrences for removal
          if (count > 0) {
            item.date = ''; // Clear duplicate date labels
          }
        });

        return { data: processedData, avgValue };
      } else {
        // For other period types, use the standard deduplication logic
        const usedLabels = new Set<string>();
        let lastLabel = '';

        const filteredChartData = chartData.map(item => {
          if (usedLabels.has(item.date)) {
            // For duplicate labels, use an empty string to hide the label
            return { ...item, date: lastLabel ? '' : item.date };
          } else {
            usedLabels.add(item.date);
            lastLabel = item.date;
            return item;
          }
        });

        return { data: filteredChartData, avgValue };
      }
    },
    enabled: !!client && !!assetId,
    retry: 2,
  });

  return {
    data: query.data?.data ?? null,
    avgValue: query.data?.avgValue ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
