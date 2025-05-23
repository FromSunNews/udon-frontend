import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { toast } from 'sonner';
import { formatRay } from '@/utils/wadraymath';
import { keysToCamelCase } from '@/utils/object';
import { AssetPrice, UserReserveData } from '@/app/(protected)/dashboard/types';
import { calculateCompoundedRate } from '@/utils/math/compounded-interest';
import { SECONDS_PER_YEAR } from '@/utils/constants';
import { normalize } from '@/utils/bignumber';

/**
 * Custom hook to fetch complete asset data for a user using get_all_fields_user_reserve_data
 */
export function useCompletedAssets() {
  const { client, account } = useChromiaAccount();
  const [userReserves, setUserReserves] = useState<UserReserveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserReserves = useCallback(async () => {
    if (!client || !account) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all user reserve data
      const result = await client.query('get_all_fields_user_reserve_data', {
        user_id: account.id,
      });
      // convert key in object to camelCase
      let reserves = (Array.isArray(result) ? result : []).map(r => keysToCamelCase(r));
      console.log('reserves', reserves);

      // 2. Fetch prices

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const assetIds: any = [];
      reserves.map(r => assetIds.push(r.assetId));

      console.log('assetIds', Buffer.from(assetIds[0], 'hex'));
      // const pricesResult = await client.query('get_latest_price_by_asset_ids', {
      //   asset_ids: assetIds,
      // });
      const pricesResult = (await client.query('get_latest_price_by_asset_ids', {
        asset_ids: assetIds,
      })) as unknown as AssetPrice[];
      console.log('pricesResult', pricesResult);

      // 3. Map price to each reserve
      const prices: AssetPrice[] = Array.isArray(pricesResult) ? pricesResult : [];
      console.log('prices', prices);

      // 2. Format Ray for all big number fields and convert to number
      /* eslint-disable @typescript-eslint/no-explicit-any */
      reserves = reserves.map((r: any) => {
        const priceObj = prices.find(p => p.stork_asset_id === r.symbol);

        return {
          // asset

          ...r,
          assetId: Buffer.from(r.assetId, 'hex'),
          // reserve
          totalSupply: Number(formatRay(r.totalSupply)),
          balance: Number(formatRay(r.balance)),
          reserveUnbacked: Number(formatRay(r.reserveUnbacked)),
          reserveAccruedToTreasury: Number(formatRay(r.reserveAccruedToTreasury)),
          currentATokenBalance: Number(formatRay(r.currentATokenBalance)),
          currentATokenTotalSupply: Number(formatRay(r.currentATokenTotalSupply)),
          currentVariableDebt: Number(formatRay(r.currentVariableDebt)),
          currentVariableDebtTokenTotalSupply: Number(
            formatRay(r.currentVariableDebtTokenTotalSupply)
          ),
          reserveCurrentLiquidityRate: Number(formatRay(r.reserveCurrentLiquidityRate)),
          reserveCurrentVariableBorrowRate: Number(formatRay(r.reserveCurrentVariableBorrowRate)),
          reserveLiquidityIndex: Number(formatRay(r.reserveLiquidityIndex)),
          reserveVariableBorrowIndex: Number(formatRay(r.reserveVariableBorrowIndex)),
          reserveLastUpdateTimestamp: Number(r.reserveLastUpdateTimestamp),
          usageAsCollateralEnabled: !!r.usageAsCollateralEnabled,
          price: Number(priceObj?.price),
          supplyCap: Number(formatRay(r.supplyCap)),
          borrowCap: Number(formatRay(r.borrowCap)),

          // calculate field
          availableBorrow:
            r.borrowCap > 0n
              ? Number(formatRay(r.borrowCap - r.currentVariableDebtTokenTotalSupply))
              : 0,
          supplyAPY: Number(
            normalize(
              calculateCompoundedRate({
                rate: r.reserveCurrentLiquidityRate,
                duration: SECONDS_PER_YEAR,
              }),
              27
            )
          ),
          borrowAPY: Number(
            normalize(
              calculateCompoundedRate({
                rate: r.reserveCurrentVariableBorrowRate,
                duration: SECONDS_PER_YEAR,
              }),
              27
            )
          ),
        } as UserReserveData;
      });

      console.log('process fields:', reserves);

      setUserReserves(reserves);
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('Unknown error');
      setError(typedError);
      toast.error('Failed to load your positions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [client, account]);

  useEffect(() => {
    fetchUserReserves();
  }, [fetchUserReserves]);

  // For compatibility with old API, split supply/borrow positions
  const supplyPositions = useMemo(
    () => userReserves.filter(r => r.currentATokenBalance > 0n),
    [userReserves]
  );
  const borrowPositions = useMemo(
    () => userReserves.filter(r => r.currentVariableDebt > 0n),
    [userReserves]
  );

  const totalDeposit = useMemo(() => {
    return userReserves.reduce((sum, r) => sum + Number(r.currentATokenTotalSupply) * r.price, 0);
  }, [userReserves]);

  const totalBorrow = useMemo(() => {
    return userReserves.reduce(
      (sum, r) => sum + Number(r.currentVariableDebtTokenTotalSupply) * r.price,
      0
    );
  }, [userReserves]);

  const yourSupplyBalancePosition = useMemo(() => {
    return userReserves.reduce((sum, r) => sum + Number(r.currentATokenBalance) * r.price, 0);
  }, [userReserves]);

  const yourSupplyCollateralPosition = useMemo(() => {
    return userReserves.reduce(
      (sum, r) => sum + (r.usageAsCollateralEnabled ? Number(r.currentATokenBalance) * r.price : 0),
      0
    );
  }, [userReserves]);

  const yourSupplyAPYPosition = useMemo(() => {
    if (!userReserves.length) return 0;
    const total = userReserves.reduce((sum, r) => sum + (r.supplyAPY || 0), 0);
    return total / userReserves.length;
  }, [userReserves]);

  const yourBorrowBalancePosition = useMemo(() => {
    return userReserves.reduce((sum, r) => sum + Number(r.currentVariableDebt) * r.price, 0);
  }, [userReserves]);

  const yourBorrowAPYPosition = useMemo(() => {
    if (!userReserves.length) return 0;
    const total = userReserves.reduce((sum, r) => sum + (r.borrowAPY || 0), 0);
    return total / userReserves.length;
  }, [userReserves]);

  const yourBorrowPowerUsagePosition = useMemo(() => {
    return userReserves.reduce(
      (sum, r) => sum + r.currentVariableDebtTokenTotalSupply / r.currentVariableDebt,
      0
    );
  }, [userReserves]);

  const enableBorrow = useMemo(() => {
    const enable = !!userReserves.some(
      r => r.currentATokenBalance > 0 && r.usageAsCollateralEnabled
    );
    console.log('enableBorrow', enable);
    return enable;
  }, [userReserves]);

  return {
    assets: userReserves, // all user reserves (with asset info)
    supplyPositions,
    borrowPositions,
    totalDeposit,
    totalBorrow,
    yourSupplyBalancePosition,
    yourSupplyCollateralPosition,
    yourSupplyAPYPosition,
    yourBorrowBalancePosition,
    yourBorrowAPYPosition,
    yourBorrowPowerUsagePosition,
    enableBorrow,
    isLoading,
    error,
    refresh: fetchUserReserves,
  };
}
