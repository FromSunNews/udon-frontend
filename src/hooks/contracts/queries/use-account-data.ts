import { useQuery } from '@tanstack/react-query';
import { useChromiaAccount } from '../../configs/chromia-hooks';
import { keysToCamelCase } from '@/utils/object';
import { UserAccountData } from '@/app/(protected)/dashboard/types';
import { useGetMaxU256 } from './use-get-max-u256';
// import { normalizeBN } from '@/utils/bignumber';

/**
 * Hook to fetch stats supply deposit from the Chromia blockchain using TanStack Query
 * @returns Query result with data, isLoading, error, and refetch function
 */
export function useAccountData() {
  const { client, account } = useChromiaAccount();
  const { data: maxU256, isLoading: isMaxU256Loading } = useGetMaxU256();

  // Use TanStack Query to fetch and cache stats supply deposit data
  const query = useQuery({
    queryKey: ['get_user_account_data'],
    queryFn: async () => {
      if (!client || !account?.id) {
        console.log('Fetch account data skipped:', {
          hasClient: !!client,
          hasAccountId: !!account?.id,
        });
        throw new Error('Missing client or account ID');
      }

      console.log('Fetching account data ... ');

      const accountDataRaw = await client.query('get_user_account_data', {
        user_address: account?.id,
      });

      const {
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor,
      } = keysToCamelCase(accountDataRaw);

      console.log('totalCollateralBase', totalCollateralBase);
      console.log('totalDebtBase', totalDebtBase);
      console.log('availableBorrowsBase', availableBorrowsBase);
      console.log('currentLiquidationThreshold', currentLiquidationThreshold);
      console.log('ltv', ltv);
      console.log('healthFactor', healthFactor);

      // const decimals = 18;
      console.log('Received account data:', accountDataRaw);
      // return {
      //   totalCollateralBase: Number(normalizeBN(totalCollateralBase.toString(), decimals)),
      //   totalDebtBase: Number(normalizeBN(totalDebtBase.toString(), decimals)),
      //   availableBorrowsBase: Number(normalizeBN(availableBorrowsBase.toString(), decimals)),
      //   currentLiquidationThreshold: Number(currentLiquidationThreshold) / 100,
      //   ltv: Number(ltv) / 100,
      //   healthFactor:
      //     maxU256 === healthFactor ? -1 : Number(normalizeBN(healthFactor.toString(), decimals)),
      // } as unknown as UserAccountData;

      return {
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor: maxU256 === healthFactor ? -1 : healthFactor,
      } as unknown as UserAccountData;
    },
    enabled: !!client && !isMaxU256Loading,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests twice
    // networkMode: 'offlineFirst', // priority cache first
  });

  return {
    data: query.data as UserAccountData,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
