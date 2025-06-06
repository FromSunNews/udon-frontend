import { useCallback } from 'react';
import { createAmount, op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';

interface BorrowParams {
  assetId: Buffer<ArrayBufferLike>;
  amount: number | string;
  decimals: number;
  interestRateMode?: number; // 1 for stable, 2 for variable
  isUserBorrowMax?: number;
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
  const { account, client } = useChromiaAccount();
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

        let amountValue;
        // signal for rell recognize we want to withdraw with max amount
        if (params.isUserBorrowMax) {
          if (!client) {
            throw new Error('Client not available');
          }
          amountValue = await client.query('get_u256_max_query', {});
        } else amountValue = createAmount(params.amount, params.decimals).value;

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));

        // Execute borrow operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'borrow',
              params.assetId, // asset ID to borrow
              amountValue, // amount
              2, // interest rate mode (default: variable)
              0, // referral code,
              account.id, // from on_behalf_of_id
              Date.now()
            )
          )
          .buildAndSend();

        // const result = await session.call({
        //   name: 'borrow',
        //   args: [
        //     params.assetId, // asset ID to borrow
        //     BigInt(amountValue.toString()), // amount
        //     2, // interest rate mode (default: variable)
        //     0, // referral code,
        //     account.id, // from on_behalf_of_id
        //     Date.now(), // Todo: implement this
        //   ],
        // });

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
