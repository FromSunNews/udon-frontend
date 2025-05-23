import { useCallback } from 'react';
import { op } from '@chromia/ft4';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { publicClientConfig } from '@/configs/client';
import { useFtSession } from '@chromia/react';
import { parseUnits } from 'ethers/lib/utils';
// import { RAY } from '@/utils/wadraymath';
// import { BigNumber } from 'ethers';

interface SupplyParams {
  assetId: string | Buffer;
  amount: number | string;
  decimals: number;
}

interface SupplyResult {
  success: boolean;
  error?: Error;
}

/**
 * Hook to supply assets to the protocol
 * @param callbacks Optional callbacks for success and error scenarios
 * @returns A function to execute supply operations
 */
export function useSupply({
  onSuccess,
  onError,
}: {
  onSuccess?: (result: SupplyResult, params: SupplyParams) => void;
  onError?: (error: Error, params: SupplyParams) => void;
} = {}) {
  const { account } = useChromiaAccount();
  const { data: session } = useFtSession(
    account ? { clientConfig: publicClientConfig, account } : null
  );

  const supply = useCallback(
    async (params: SupplyParams): Promise<SupplyResult> => {
      if (!session || !account) {
        const error = new Error('Session or account not available');
        onError?.(error, params);
        return { success: false, error };
      }

      try {
        console.log('Starting supply operation:', params);

        // Convert amount to BigInt format using toRay utility
        const amountValue = parseUnits(params.amount.toString(), 27);
        // const amountValue = BigNumber.from(RAY).mul(params.amount); //convert to RAY

        console.log('Amount in decimals format:', amountValue);
        console.log('Actual BigInt(amountValue.toString())', BigInt(amountValue.toString()));
        // Execute supply operation
        const result = await session
          .transactionBuilder()
          .add(
            op(
              'supply',
              account.id, // from account
              params.assetId, // underlying asset ID
              BigInt(amountValue.toString()), // amount
              account.id, // on behalf of account
              BigInt(0) // referral code
            )
          )
          .buildAndSend();

        console.log('Supply operation result:', result);

        const supplyResult = {
          success: true,
        };

        onSuccess?.(supplyResult, params);
        return supplyResult;
      } catch (error) {
        console.error('Supply operation failed:', error);
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

  return supply;
}
