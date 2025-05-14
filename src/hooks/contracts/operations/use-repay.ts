import { useCallback } from 'react';
import { op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';
import { parseUnits } from 'ethers/lib/utils';

interface RepayParams {
  assetId: Buffer<ArrayBufferLike>;
  amount: number | string;
  decimals: number;
  useWalletBalance?: boolean; // Option to use wallet balance or supplied collateral
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
} = {}) {
  const { account } = useChromiaAccount();
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

        // Convert amount to BigInt format using parseUnits
        const amountValue = parseUnits(params.amount.toString(), 27);

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));

        // Execute repay operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'repay',
              params.assetId, // asset ID to repay
              BigInt(amountValue.toString()), // amount
              account.id, // from account
              params.useWalletBalance ? BigInt(1) : BigInt(0), // whether to use wallet balance (1) or collateral (0)
              BigInt(Date.now()) // timestamp
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
    [session, account, onSuccess, onError]
  );

  return repay;
}
