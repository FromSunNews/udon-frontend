import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Balance } from '@chromia/ft4';
import { useChromiaAccount } from '../../configs/chromia-hooks';

interface BalanceResponse {
  data: Balance[];
}

export const BALANCE_QUERY_KEY = ['token-balance'] as const;

export function useTokenBalance() {
  const { account } = useChromiaAccount();
  const queryClient = useQueryClient();

  const {
    data: balances,
    isLoading,
    error,
  } = useQuery<BalanceResponse>({
    queryKey: BALANCE_QUERY_KEY,
    queryFn: async () => {
      if (!account) {
        throw new Error('No account found');
      }
      const result = await account.getBalances();
      return result;
    },
    select: data => ({
      data: data?.data ?? [],
    }),
    refetchInterval: 20000, // Refetch every 20 seconds
    enabled: !!account, // Only run query if account exists
  });

  // Function to manually refresh balances
  const refreshBalance = async () => {
    await queryClient.invalidateQueries({ queryKey: BALANCE_QUERY_KEY });
  };

  return {
    balances: balances?.data ?? [],
    isLoading,
    error,
    refreshBalance,
  };
}
