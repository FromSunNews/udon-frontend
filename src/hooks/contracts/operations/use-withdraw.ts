import { useCallback } from 'react';
import { op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';
import { parseUnits } from 'ethers/lib/utils';

interface WithdrawParams {
  assetId: Buffer<ArrayBufferLike>;
  amount: number | string;
  decimals: number;
}

interface WithdrawResult {
  success: boolean;
  error?: Error;
}

/**
 * Hook to withdraw assets from the protocol
 * @param callbacks Optional callbacks for success and error scenarios
 * @returns A function to execute withdraw operations
 */
export function useWithdraw({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: WithdrawResult, params: WithdrawParams) => void;
  onError?: (error: Error, params: WithdrawParams) => void;
} = {}) {
  const { account } = useChromiaAccount();
  const { data: session } = useFtSession(
    account ? { clientConfig: publicClientConfig, account } : null
  );

  const withdraw = useCallback(
    async (params: WithdrawParams): Promise<WithdrawResult> => {
      if (!session || !account) {
        const error = new Error('Session or account not available');
        onError?.(error, params);
        return { success: false, error };
      }

      try {
        console.log('Starting withdraw operation:', params);

        // Convert amount to BigInt format using parseUnits
        const amountValue = parseUnits(params.amount.toString(), 27);

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));

        // Execute withdraw operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'withdraw',
              account.id, // from account (asset owner)
              params.assetId, // asset ID to withdraw
              BigInt(amountValue.toString()), // amount
              account.id // to_id
              // Date.now() // timestamp
            )
          )
          .buildAndSend();

        console.log('Withdraw operation result:', result);

        const withdrawResult = {
          success: true,
        };

        onSuccess?.(withdrawResult, params);
        return withdrawResult;
      } catch (error) {
        console.error('Withdraw operation failed:', error);
        const errorObj = error instanceof Error ? error : new Error(String(error));
        onError?.(errorObj, params);
        return {
          success: false,
          error: errorObj,
        };
      }
    },
    [session, account, onSuccess, onError]
  );

  return withdraw;
}
