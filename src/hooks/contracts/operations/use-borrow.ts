import { useCallback } from 'react';
import { op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';
import { parseUnits } from 'ethers/lib/utils';

interface BorrowParams {
  assetId: Buffer<ArrayBufferLike>;
  amount: number | string;
  decimals: number;
  interestRateMode?: number; // 1 for stable, 2 for variable
}

interface BorrowResult {
  success: boolean;
  error?: Error;
}

/**
 * Hook to borrow assets from the protocol
 * @param callbacks Optional callbacks for success and error scenarios
 * @returns A function to execute borrow operations
 */
export function useBorrow({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: BorrowResult, params: BorrowParams) => void;
  onError?: (error: Error, params: BorrowParams) => void;
} = {}) {
  const { account } = useChromiaAccount();
  const { data: session } = useFtSession(
    account ? { clientConfig: publicClientConfig, account } : null
  );

  const borrow = useCallback(
    async (params: BorrowParams): Promise<BorrowResult> => {
      if (!session || !account) {
        const error = new Error('Session or account not available');
        onError?.(error, params);
        return { success: false, error };
      }

      try {
        console.log('Starting borrow operation:', params);

        // Convert amount to BigInt format using parseUnits
        const amountValue = parseUnits(params.amount.toString(), 27);

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));

        // Execute borrow operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'borrow',
              params.assetId, // asset ID to borrow
              BigInt(amountValue.toString()), // amount
              2, // interest rate mode (default: variable)
              0, // referral code,
              account.id // from on_behalf_of_id
              // BigInt(Date.now()) // Todo: implement this
            )
          )
          .buildAndSend();

        console.log('Borrow operation result:', result);

        const borrowResult = {
          success: true,
        };

        onSuccess?.(borrowResult, params);
        return borrowResult;
      } catch (error) {
        console.error('Borrow operation failed:', error);
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

  return borrow;
}
