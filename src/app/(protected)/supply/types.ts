import { Asset } from '@chromia/ft4';

// Define the common asset structure both components will use
export interface CommonAsset extends Asset {
  price?: number;
  balance?: string;
  balanceAmount?: bigint;
  rawBalance?: {
    amount: bigint;
    asset: Asset;
  };
  canBeCollateral?: boolean;
  supplyAPY?: number;
  borrowAPY?: number;
  icon_url?: string;
  available?: string;
}

export interface AssetPrice {
  stork_asset_id: string;
  price: number;
  timestamp: string;
}

export interface UserReserveData {
  asset: CommonAsset;
  current_a_token_balance: bigint;
  current_variable_debt: bigint;
  scaled_variable_debt: bigint;
  liquidity_rate: bigint;
  usage_as_collateral_enabled: boolean;
}
