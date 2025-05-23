import { useQuery } from '@tanstack/react-query';
import { useChromiaAccount } from '../../configs/chromia-hooks';
import { useMemo } from 'react';
import { formatRay } from '@/utils/wadraymath';
import { keysToCamelCase } from '@/utils/object';

// Define asset price interface
export interface StatsSupplyDeposit {
  assetId: Buffer<ArrayBufferLike>;
  symbol: string;
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
      return stats;
    },
    enabled: !!client,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests twice
    networkMode: 'offlineFirst', // priority cache first
  });

  const totalValueDeposited = useMemo(() => {
    return (
      query.data?.reduce((sum, r) => sum + Number(formatRay(r.totalDeposit)) * r.price, 0) || 0
    );
  }, [query.data]);

  const totalValueBorrowed = useMemo(() => {
    return query.data?.reduce((sum, r) => sum + Number(formatRay(r.totalBorrow)) * r.price, 0) || 0;
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
