import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Balance } from '@chromia/ft4';
import { useChromiaAccount } from '../../configs/chromia-hooks';

interface BalanceResponse {
  data: Balance[];
}

export const mockBalances = [
  {
    asset: {
      symbol: 'CHRereum',
      iconUrl: '/mock/chr.png', // Đảm bảo có file ảnh mock hoặc dùng 1 url hợp lệ
      decimals: 6,
    },
    amount: 1.27388,
  },
  {
    asset: {
      symbol: 'USDT',
      iconUrl: '/mock/usdt.png',
      decimals: 2,
    },
    amount: 12.22,
  },
  {
    asset: {
      symbol: 'BTC',
      iconUrl: '/mock/btc.png',
      decimals: 8,
    },
    amount: 0.005,
  },
  {
    asset: {
      symbol: 'ETH',
      iconUrl: '/mock/eth.png',
      decimals: 18,
    },
    amount: 0.1234,
  },
  {
    asset: {
      symbol: 'BNB',
      iconUrl: '/mock/bnb.png',
      decimals: 18,
    },
    amount: 2.5,
  },
  {
    asset: {
      symbol: 'SOL',
      iconUrl: '/mock/sol.png',
      decimals: 9,
    },
    amount: 15.789,
  },
  {
    asset: {
      symbol: 'DOGE',
      iconUrl: '/mock/doge.png',
      decimals: 8,
    },
    amount: 10000,
  },
  {
    asset: {
      symbol: 'ADA',
      iconUrl: '/mock/ada.png',
      decimals: 6,
    },
    amount: 3200.5,
  },
  {
    asset: {
      symbol: 'MATIC',
      iconUrl: '/mock/matic.png',
      decimals: 18,
    },
    amount: 500.123,
  },
  {
    asset: {
      symbol: 'TEST1',
      iconUrl: '/mock/test1.png',
      decimals: 4,
    },
    amount: 123.4567,
  },
  {
    asset: {
      symbol: 'TEST2',
      iconUrl: '/mock/test2.png',
      decimals: 2,
    },
    amount: 9876.54,
  },
];

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
