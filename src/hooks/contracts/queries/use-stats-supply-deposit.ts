import { useQuery } from '@tanstack/react-query';
import { useChromiaAccount } from '../../configs/chromia-hooks';
import { useMemo } from 'react';
import { keysToCamelCase } from '@/utils/object';
import { normalizeBN } from '@/utils/bignumber';

// Define asset price interface
export interface StatsSupplyDeposit {
  assetId: Buffer<ArrayBufferLike>;
  symbol: string;
  decimals: number;
  totalDeposit: number;
  totalBorrow: number;
  price: number;
}

/**
 * Hook to fetch stats supply deposit from the Chromia blockchain using TanStack Query
 * @returns Query result with data, isLoading, error, and refetch function
 */
export function useStatsSupplyDeposit() {
  const { client } = useChromiaAccount();

  // Use TanStack Query to fetch and cache stats supply deposit data
  const query = useQuery({
    queryKey: ['get_stats_supply_deposit'],
    queryFn: async () => {
      if (!client) {
        console.log('Fetch stats supply deposit skipped:', {
          hasClient: !!client,
        });
        throw new Error('Missing client or asset ID');
      }

      console.log('Fetching stats supply deposit ... ');

      const statsRaw = await client.query('get_stats_supply_deposit', {});

      const stats = (Array.isArray(statsRaw) ? statsRaw : []).map(r => keysToCamelCase(r));

      console.log('Received stats supply deposit:', stats);
      return stats as StatsSupplyDeposit[];
    },
    enabled: !!client,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests twice
    // networkMode: 'offlineFirst', // priority cache first
  });

  const totalValueDeposited = useMemo(() => {
    return (
      query.data?.reduce(
        (sum, r) => sum + Number(normalizeBN(r.totalDeposit.toString() || 0, r.decimals)) * r.price,
        0
      ) || 0
    );
  }, [query.data]);

  const totalValueBorrowed = useMemo(() => {
    return (
      query.data?.reduce(
        (sum, r) => sum + Number(normalizeBN(r.totalBorrow.toString() || 0, r.decimals)) * r.price,
        0
      ) || 0
    );
  }, [query.data]);

  return {
    data: query.data,
    totalValueDeposited,
    totalValueBorrowed,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
