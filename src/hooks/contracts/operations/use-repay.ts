import { useCallback } from 'react';
import { createAmount, op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';

interface RepayParams {
  assetId: Buffer<ArrayBufferLike>;
  amount: number | string;
  decimals: number;
  useWalletBalance?: boolean; // Option to use wallet balance or supplied collateral
  isRepayMax?: boolean;
}

interface RepayResult {
  success: boolean;
  error?: Error;
}

/**
 * Hook to repay borrowed assets to the protocol
 * @param callbacks Optional callbacks for success and error scenarios
 * @returns A function to execute repay operations
 */
export function useRepay({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: RepayResult, params: RepayParams) => void;
  onError?: (error: Error, params: RepayParams) => void;
  isRepayMax?: boolean;
} = {}) {
  const { account, client } = useChromiaAccount();
  const { data: session } = useFtSession(
    account ? { clientConfig: publicClientConfig, account } : null
  );

  const repay = useCallback(
    async (params: RepayParams): Promise<RepayResult> => {
      if (!session || !account) {
        const error = new Error('Session or account not available');
        onError?.(error, params);
        return { success: false, error };
      }

      try {
        console.log('Starting repay operation:', params);

        let amountValue;
        // signal for rell recognize we want to withdraw with max amount
        if (params.isRepayMax) {
          if (!client) {
            throw new Error('Client not available');
          }
          amountValue = await client.query('get_u256_max_query', {});
        } else amountValue = createAmount(params.amount, params.decimals).value;

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));

        // Execute repay operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'repay',
              params.assetId, // asset ID to repay
              amountValue, // amount
              2, // 2 = interest_rate_mode
              account.id // from account
              // Date.now()
            )
          )
          .buildAndSend();

        console.log('Repay operation result:', result);

        const repayResult = {
          success: true,
        };

        onSuccess?.(repayResult, params);
        return repayResult;
      } catch (error) {
        console.error('Repay operation failed:', error);
        const errorObj = error instanceof Error ? error : new Error(String(error));
        onError?.(errorObj, params);
        return {
          success: false,
          error: errorObj,
        };
      }
    },
    [session, account, onSuccess, onError, client]
  );

  return repay;
}
