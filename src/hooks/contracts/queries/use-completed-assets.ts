import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChromiaAccount } from '@/hooks/configs/chromia-hooks';
import { toast } from 'sonner';
import { formatRay } from '@/utils/wadraymath';
import { keysToCamelCase } from '@/utils/object';
import { AssetPrice, UserReserveData } from '@/app/(protected)/dashboard/types';
import { calculateCompoundedRate } from '@/utils/math/compounded-interest';
import { SECONDS_PER_YEAR } from '@/utils/constants';
import { normalizeBN } from '@/utils/bignumber';

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
          // replace USD with empty string at end of string
          symbol: r.symbol.replace(/USD$/, ''),
          assetId: Buffer.from(r.assetId, 'hex'),
          // reserve
          totalSupply: Number(normalizeBN(r.totalSupply.toString(), r.decimals)),
          balance: Number(normalizeBN(r.balance.toString(), r.decimals)),
          reserveUnbacked: Number(normalizeBN(r.reserveUnbacked.toString(), r.decimals)),
          reserveAccruedToTreasury: Number(
            normalizeBN(r.reserveAccruedToTreasury.toString(), r.decimals)
          ),
          currentATokenBalance: Number(normalizeBN(r.currentATokenBalance.toString(), r.decimals)),
          currentATokenTotalSupply: Number(
            normalizeBN(r.currentATokenTotalSupply.toString(), r.decimals)
          ),
          currentVariableDebt: Number(normalizeBN(r.currentVariableDebt.toString(), r.decimals)),
          currentVariableDebtTokenTotalSupply: Number(
            normalizeBN(r.currentVariableDebtTokenTotalSupply.toString(), r.decimals)
          ),
          reserveCurrentLiquidityRate: Number(formatRay(r.reserveCurrentLiquidityRate)),
          reserveCurrentVariableBorrowRate: Number(formatRay(r.reserveCurrentVariableBorrowRate)),
          reserveLiquidityIndex: Number(formatRay(r.reserveLiquidityIndex)),
          reserveVariableBorrowIndex: Number(formatRay(r.reserveVariableBorrowIndex)),
          reserveLastUpdateTimestamp: Number(r.reserveLastUpdateTimestamp),
          usageAsCollateralEnabled: !!r.usageAsCollateralEnabled,
          price: Number(priceObj?.price),
          supplyCap: Number(normalizeBN(r.supplyCap.toString(), r.decimals)),
          borrowCap: Number(normalizeBN(r.borrowCap.toString(), r.decimals)),
          ltv: Number(r.ltv) / 100,
          availableLiquidity: Number(normalizeBN(r.availableLiquidity.toString(), r.decimals)),

          supplyAPY: Number(
            normalizeBN(
              calculateCompoundedRate({
                rate: r.reserveCurrentLiquidityRate,
                duration: SECONDS_PER_YEAR,
              }),
              27
            )
          ),
          borrowAPY: Number(
            normalizeBN(
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

  // const availableLiquidityTokens = useMemo(() => {
  //   // caculate available liquidity of user
  //   const totalCollateralUSD = userReserves.reduce(
  //     (sum, r) => sum + (r.usageAsCollateralEnabled ? Number(r.currentATokenBalance) * r.price : 0),
  //     0
  //   );
  //   const totalDebtUSD = userReserves.reduce(
  //     (sum, r) => sum + Number(r.currentVariableDebt) * r.price,
  //     0
  //   );
  //   const availableLiquidityTokens = userReserves.map(r => {
  //     const availableTokenInPoolRaw =
  //       r.currentATokenTotalSupply - r.currentVariableDebtTokenTotalSupply;
  //     const availableTokenInPool = availableTokenInPoolRaw < 0 ? 0 : availableTokenInPoolRaw;

  //     console.log('currentATokenTotalSupply ' + r.symbol, r.currentATokenTotalSupply);
  //     console.log(
  //       'currentVariableDebtTokenTotalSupply ' + r.symbol,
  //       r.currentVariableDebtTokenTotalSupply
  //     );
  //     console.log('availableTokenInPool ' + r.symbol, availableTokenInPool);
  //     const totalLiquidityCanBeBorrowedUSD = totalCollateralUSD * (r.ltv / 100) - totalDebtUSD;
  //     let availableLiquidityToken = 0;
  //     if (totalLiquidityCanBeBorrowedUSD > 0) {
  //       availableLiquidityToken = totalLiquidityCanBeBorrowedUSD / r.price;
  //     }
  //     return {
  //       assetId: r.assetId,
  //       symbol: r.symbol,
  //       availableLiquidityToken:
  //         availableLiquidityToken > availableTokenInPool
  //           ? availableTokenInPool
  //           : availableLiquidityToken,
  //     };
  //   });
  //   console.log('totalCollateralUSD', totalCollateralUSD);
  //   console.log('totalDebtUSD', totalDebtUSD);
  //   console.log('availableLiquidityTokens', availableLiquidityTokens);
  //   return availableLiquidityTokens;
  // }, [userReserves]);

  return {
    assets: userReserves, // all user reserves (with asset info)
    supplyPositions,
    borrowPositions,
    yourSupplyBalancePosition,
    yourSupplyCollateralPosition,
    yourSupplyAPYPosition,
    yourBorrowBalancePosition,
    yourBorrowAPYPosition,
    yourBorrowPowerUsagePosition,
    enableBorrow,
    // availableLiquidityTokens,
    isLoading,
    error,
    refresh: fetchUserReserves,
  };
}
