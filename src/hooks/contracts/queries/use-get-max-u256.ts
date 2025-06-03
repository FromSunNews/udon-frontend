import { useQuery } from '@tanstack/react-query';
import { useChromiaAccount } from '../../configs/chromia-hooks';

/**
 * Hook to fetch stats supply deposit from the Chromia blockchain using TanStack Query
 * @returns Query result with data, isLoading, error, and refetch function
 */
export function useGetMaxU256() {
  const { client } = useChromiaAccount();

  // Use TanStack Query to fetch and cache stats supply deposit data
  const query = useQuery({
    queryKey: ['get_max_u256'],
    queryFn: async () => {
      if (!client) {
        console.log('Fetch max u256 skipped:', {
          hasClient: !!client,
        });
        throw new Error('Missing client');
      }

      console.log('Fetching max u256 ... ');

      const max256 = await client.query('get_u256_max_query', {});
      console.log('max256', max256);
      return max256;
    },
    enabled: !!client,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
