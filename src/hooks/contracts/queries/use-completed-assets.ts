import { useCallback, useEffect, useMemo, useState } from 'react';
import { Asset, PaginatedEntity } from '@chromia/ft4';
import { useChromiaAccount, useChromiaQuery } from '@/hooks/configs/chromia-hooks';
import { toast } from 'sonner';
import { formatRay } from '@/utils/wadraymath';
import { CommonAsset, UserReserveData } from '@/app/(protected)/supply/types';

interface AssetPrice {
  stork_asset_id: string;
  price: number;
  timestamp: string;
}

interface FetchState {
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch complete asset data including:
 * - Basic asset information (from ft4.get_assets_by_type)
 * - Asset prices (from get_latest_price_by_asset_ids)
 * - User balances (from ft4.get_asset_balances)
 * - User supply and borrow positions
 */
export function useCompletedAssets() {
  const { client, account } = useChromiaAccount();
  const [fetchState, setFetchState] = useState<{
    prices: FetchState;
    balances: FetchState;
    reserves: FetchState;
  }>({
    prices: { isLoading: false, error: null },
    balances: { isLoading: false, error: null },
    reserves: { isLoading: false, error: null },
  });

  const [processedAssets, setProcessedAssets] = useState<CommonAsset[]>([]);
  const [supplyPositions, setSupplyPositions] = useState<UserReserveData[]>([]);
  const [borrowPositions, setBorrowPositions] = useState<UserReserveData[]>([]);

  // Step 1: Fetch assets list
  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    error: assetsError,
    mutate: refetchAssets,
  } = useChromiaQuery<string, Record<string, unknown>, PaginatedEntity<Asset>>({
    queryName: 'ft4.get_assets_by_type',
    queryParams: {
      type: 'ft4',
      page_size: null,
      page_cursor: null,
    },
    swrConfiguration: {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    },
  });

  // Step 2: Fetch asset prices
  const fetchPrices = useCallback(
    async (assets: Asset[]): Promise<CommonAsset[]> => {
      if (!client || !assets?.length) return [];

      try {
        setFetchState(prev => ({
          ...prev,
          prices: { isLoading: true, error: null },
        }));

        const assetIds = assets.map(asset => asset.id);
        const prices = (await client.query('get_latest_price_by_asset_ids', {
          asset_ids: assetIds,
        })) as unknown as AssetPrice[];

        // Create assets with price data - avoid excessive logging in production
        const assetsWithPriceData = assets.map(asset => {
          const assetPrice = prices.find(p => p.stork_asset_id === asset.symbol);
          return {
            ...asset,
            price: Number(assetPrice?.price) || 0,
            balance: '0', // Initialize with zero string for compatibility
          } as CommonAsset;
        });

        return assetsWithPriceData;
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error('Unknown error');
        console.error('Failed to fetch prices:', typedError);
        toast.error('Failed to load asset prices. Please try again.');
        setFetchState(prev => ({
          ...prev,
          prices: { isLoading: false, error: typedError },
        }));
        return [];
      } finally {
        setFetchState(prev => ({
          ...prev,
          prices: { ...prev.prices, isLoading: false },
        }));
      }
    },
    [client]
  );

  // Step 3: Fetch user balances
  const fetchBalances = useCallback(
    async (assetsWithPrices: CommonAsset[]): Promise<CommonAsset[]> => {
      if (!client || !account || !assetsWithPrices.length) return assetsWithPrices;

      try {
        setFetchState(prev => ({
          ...prev,
          balances: { isLoading: true, error: null },
        }));

        // Query balances from the blockchain
        const result = await client.query('ft4.get_asset_balances', {
          account_id: account.id,
          page_size: null,
          page_cursor: null,
        });
        const balancesRaw = result as unknown as PaginatedEntity<{ amount: bigint; asset: Asset }>;

        // Process assets with balance information
        return assetsWithPrices.map(asset => {
          // Find the corresponding balance for this asset
          const balance = balancesRaw.data.find(b => Buffer.compare(b.asset.id, asset.id) === 0);

          // Convert Amount to string
          const balanceString = balance ? formatRay(balance.amount) : '0';

          return {
            ...asset,
            balance: balanceString,
            balanceAmount: balance?.amount,
            rawBalance: balance,
          };
        });
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error('Unknown error');
        console.error('Failed to fetch balances:', typedError);
        toast.error('Failed to load your asset balances. Please try again.');
        setFetchState(prev => ({
          ...prev,
          balances: { isLoading: false, error: typedError },
        }));
        return assetsWithPrices; // Return assets with prices but without balances
      } finally {
        setFetchState(prev => ({
          ...prev,
          balances: { ...prev.balances, isLoading: false },
        }));
      }
    },
    [client, account]
  );

  // Step 4: Fetch user reserves data for supply and borrow positions
  const fetchUserReserves = useCallback(
    async (assets: CommonAsset[]): Promise<void> => {
      if (!client || !account || !assets.length) return;

      try {
        setFetchState(prev => ({
          ...prev,
          reserves: { isLoading: true, error: null },
        }));

        // In a real implementation, you would fetch this data from the blockchain
        // Here we're using mock data with a delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create mock data for supply positions
        const mockSupplyPositions = assets.map(asset => ({
          asset,
          current_a_token_balance: BigInt(Math.floor(Math.random() * 20000000000)),
          current_variable_debt: BigInt(0),
          scaled_variable_debt: BigInt(0),
          liquidity_rate: BigInt(Math.floor(Math.random() * 1000000)),
          usage_as_collateral_enabled: true,
        }));

        // Create mock data for borrow positions - only use first two assets for demo
        const mockBorrowPositions = assets.slice(0, 2).map(asset => ({
          asset,
          current_a_token_balance: BigInt(0),
          current_variable_debt: BigInt(Math.floor(Math.random() * 10000000000)),
          scaled_variable_debt: BigInt(Math.floor(Math.random() * 9000000000)),
          liquidity_rate: BigInt(0),
          usage_as_collateral_enabled: true,
        }));

        // Update state with mock data
        setSupplyPositions(mockSupplyPositions);
        setBorrowPositions(mockBorrowPositions);

        // update canBeCollateral - use the assets parameter instead of processedAssets state
        setProcessedAssets(prevAssets =>
          prevAssets.map(asset => ({
            ...asset,
            canBeCollateral: mockSupplyPositions.find(
              position => position.asset.id.toString() === asset.id.toString()
            )?.usage_as_collateral_enabled,
          }))
        );
      } catch (error) {
        const typedError = error instanceof Error ? error : new Error('Unknown error');
        console.error('Failed to fetch user reserves:', typedError);
        toast.error('Failed to load your positions. Please try again.');
        setFetchState(prev => ({
          ...prev,
          reserves: { isLoading: false, error: typedError },
        }));
      } finally {
        setFetchState(prev => ({
          ...prev,
          reserves: { ...prev.reserves, isLoading: false },
        }));
      }
    },
    [client, account]
  );

  // Main function to load all data
  const loadAllData = useCallback(async () => {
    if (!assetsData?.data) return;

    try {
      // Step 1: Get assets with prices
      const assetsWithPrices = await fetchPrices(assetsData.data);
      if (!assetsWithPrices.length) return;

      // Step 2: Get assets with prices and balances
      const completedAssets = await fetchBalances(assetsWithPrices);

      // Update state
      setProcessedAssets(completedAssets);

      // Step 3: Fetch user positions after assets are loaded
      await fetchUserReserves(completedAssets);
    } catch (error) {
      console.error('Error loading complete asset data:', error);
      toast.error('Failed to load complete asset data');
    }
  }, [assetsData, fetchPrices, fetchBalances, fetchUserReserves]);

  // Load data when asset data changes - using a stable loadAllData reference
  useEffect(() => {
    if (assetsData?.data) {
      loadAllData();
    }
  }, [assetsData, loadAllData]);

  // Derive loading state from all sources
  const isLoading = useMemo(
    () =>
      isLoadingAssets ||
      fetchState.prices.isLoading ||
      fetchState.balances.isLoading ||
      fetchState.reserves.isLoading,
    [
      isLoadingAssets,
      fetchState.prices.isLoading,
      fetchState.balances.isLoading,
      fetchState.reserves.isLoading,
    ]
  );

  // Aggregate errors
  const error = useMemo(
    () =>
      assetsError ||
      fetchState.prices.error ||
      fetchState.balances.error ||
      fetchState.reserves.error,
    [assetsError, fetchState.prices.error, fetchState.balances.error, fetchState.reserves.error]
  );

  // Show error toast if API calls fail
  useEffect(() => {
    if (error) {
      toast.error('Failed to load assets. Please try again.');
    }
  }, [error]);

  // Function to refresh all data
  const refreshAllData = useCallback(async () => {
    await refetchAssets();
    // loadAllData will be triggered by the assetsData change
  }, [refetchAssets]);

  return {
    assets: processedAssets,
    supplyPositions,
    borrowPositions,
    isLoading,
    error,
    refresh: refreshAllData,
  };
}
