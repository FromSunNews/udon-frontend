import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransferHistoryEntry, PaginatedEntity } from '@chromia/ft4';
import { useChromiaAccount } from '../../configs/chromia-hooks';

export const TRANSFER_HISTORY_QUERY_KEY = ['transfer-history'] as const;

export function useTransferHistory() {
  const { account } = useChromiaAccount();
  const queryClient = useQueryClient();

  const {
    data: history,
    isLoading,
    error,
  } = useQuery<PaginatedEntity<TransferHistoryEntry>>({
    queryKey: TRANSFER_HISTORY_QUERY_KEY,
    queryFn: async () => {
      if (!account) {
        throw new Error('No account found');
      }
      return account.getTransferHistory();
    },
    refetchInterval: 20000, // Refetch every 20 seconds
    enabled: !!account, // Only run query if account exists
  });

  // Function to manually refresh history
  const refreshHistory = async () => {
    await queryClient.invalidateQueries({ queryKey: TRANSFER_HISTORY_QUERY_KEY });
  };

  return {
    transfers: history?.data ?? [],
    isLoading,
    error,
    refreshHistory,
  };
}
