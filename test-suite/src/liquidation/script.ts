import { BlockchainClient, ClientCache } from '@chromia/rpc';

import * as fs from 'fs';
import * as path from 'path';
import BigNumber from 'bignumber.js';

interface UserPosition {
  userId: string;
  healthFactor: number;
  totalCollateralBase: number;
  totalDebtBase: number;
  reserves: {
    assetId: string;
    symbol: string;
    debt: number;
    collateral: number;
  }[];
}

interface Config {
  nodeUrl: string;
  chainId: string;
  liquidatorPrivateKey: string;
  liquidatorAccountId: string;
  healthFactorThreshold: number;
  minProfitPercentage: number;
  gasLimit: number;
  supportedAssets: {
    name: string;
    symbol: string;
    assetId: string;
    decimals: number;
  }[];
}

interface ReserveData {
  asset_id: string;
  debt: string;
  collateral: string;
}

// Load configuration
const loadConfig = (): Config => {
  try {
    const configPath = path.resolve(__dirname, '../config/liquidation-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.error('Failed to load configuration:', error);
    throw new Error('Configuration loading failed');
  }
};

// Initialize blockchain client
const initClient = async (config: Config): Promise<BlockchainClient> => {
  try {
    const client = await BlockchainClient.create({
      url: config.nodeUrl,
      cache: new ClientCache(),
      chainId: config.chainId,
    });
    return client;
  } catch (error) {
    console.error('Failed to initialize blockchain client:', error);
    throw error;
  }
};

// Fetch all users with positions
const fetchUsersWithPositions = async (client: BlockchainClient): Promise<string[]> => {
  try {
    const response = await client.query('get_all_users_with_positions', {});
    const userIds = JSON.parse(response as string) as string[];
    console.log(`Found ${userIds.length} users with positions`);
    return userIds;
  } catch (error) {
    console.error('Failed to fetch users with positions:', error);
    throw error;
  }
};

// Fetch user account data including health factor
const fetchUserAccountData = async (
  client: BlockchainClient,
  userId: string
): Promise<{
  healthFactor: number;
  totalCollateralBase: number;
  totalDebtBase: number;
}> => {
  try {
    const response = await client.query('get_user_account_data', { user_id: userId });
    const accountData = JSON.parse(response as string);
    return {
      healthFactor: parseFloat(accountData.health_factor),
      totalCollateralBase: parseFloat(accountData.total_collateral_base),
      totalDebtBase: parseFloat(accountData.total_debt_base),
    };
  } catch (error) {
    console.error(`Failed to fetch account data for user ${userId}:`, error);
    throw error;
  }
};

// Fetch user reserves (debts and collaterals)
const fetchUserReserves = async (
  client: BlockchainClient,
  userId: string,
  config: Config
): Promise<
  {
    assetId: string;
    symbol: string;
    debt: number;
    collateral: number;
  }[]
> => {
  try {
    const response = await client.query('get_user_reserves', { user_id: userId });
    const reserves = JSON.parse(response as string) as ReserveData[];

    return config.supportedAssets
      .map(asset => {
        const reserve = reserves.find(r => r.asset_id === asset.assetId);
        return {
          assetId: asset.assetId,
          symbol: asset.symbol,
          debt: reserve ? parseFloat(reserve.debt) : 0,
          collateral: reserve ? parseFloat(reserve.collateral) : 0,
        };
      })
      .filter(r => r.debt > 0 || r.collateral > 0);
  } catch (error) {
    console.error(`Failed to fetch reserves for user ${userId}:`, error);
    throw error;
  }
};

// Find users eligible for liquidation
const findUsersEligibleForLiquidation = async (
  client: BlockchainClient,
  config: Config
): Promise<UserPosition[]> => {
  try {
    const users = await fetchUsersWithPositions(client);
    const eligibleUsers: UserPosition[] = [];

    for (const userId of users) {
      const accountData = await fetchUserAccountData(client, userId);

      // Skip users with health factor above threshold or without debt
      if (
        accountData.healthFactor >= config.healthFactorThreshold ||
        accountData.totalDebtBase === 0
      ) {
        continue;
      }

      const reserves = await fetchUserReserves(client, userId, config);

      // Only consider users who have both debt and collateral
      if (reserves.some(r => r.debt > 0) && reserves.some(r => r.collateral > 0)) {
        eligibleUsers.push({
          userId,
          healthFactor: accountData.healthFactor,
          totalCollateralBase: accountData.totalCollateralBase,
          totalDebtBase: accountData.totalDebtBase,
          reserves,
        });
      }
    }

    console.log(`Found ${eligibleUsers.length} users eligible for liquidation`);
    return eligibleUsers;
  } catch (error) {
    console.error('Failed to find users eligible for liquidation:', error);
    throw error;
  }
};

// Calculate optimal debt asset and collateral asset for liquidation
const calculateOptimalLiquidationStrategy = (
  user: UserPosition
): { debtAssetId: string; collateralAssetId: string } | null => {
  try {
    const debtAssets = user.reserves.filter(r => r.debt > 0);
    const collateralAssets = user.reserves.filter(r => r.collateral > 0);

    if (debtAssets.length === 0 || collateralAssets.length === 0) {
      return null;
    }

    // For now, simply choose the first debt and collateral assets
    // In a more sophisticated strategy, we would calculate the most profitable pair
    return {
      debtAssetId: debtAssets[0].assetId,
      collateralAssetId: collateralAssets[0].assetId,
    };
  } catch (error) {
    console.error('Failed to calculate optimal liquidation strategy:', error);
    return null;
  }
};

// Execute liquidation
const executeLiquidation = async (
  client: BlockchainClient,
  liquidatorKeyPair: KeyPair,
  liquidatorAccountId: string,
  userId: string,
  collateralAssetId: string,
  debtAssetId: string
): Promise<boolean> => {
  try {
    console.log(`Executing liquidation for user ${userId}`);
    console.log(`Debt asset: ${debtAssetId}`);
    console.log(`Collateral asset: ${collateralAssetId}`);

    // Max value for debt to cover - will liquidate all possible debt
    const maxValue = new BigNumber(2).pow(256).minus(1).toString();

    const result = await client.execute(
      'execute_liquidation_call',
      {
        collateral_asset_id: collateralAssetId,
        debt_asset_id: debtAssetId,
        user_id: userId,
        debt_to_cover: maxValue,
        receive_a_asset: false,
      },
      liquidatorKeyPair
    );

    console.log('Liquidation executed successfully:', result);
    return true;
  } catch (error) {
    console.error('Failed to execute liquidation:', error);
    return false;
  }
};

// Auth operation wrapper
const ftAuthOperationFor = async (
  client: BlockchainClient,
  liquidatorKeyPair: KeyPair
): Promise<unknown> => {
  try {
    return await client.execute(
      'lib.ft4.auth.ft_auth_operation_for',
      { pubkey: liquidatorKeyPair.pubKey },
      liquidatorKeyPair
    );
  } catch (error) {
    console.error('Failed to create auth operation:', error);
    throw error;
  }
};

// Main liquidation function
const runLiquidation = async (): Promise<void> => {
  console.log('Starting liquidation check...');

  try {
    const config = loadConfig();
    const client = await initClient(config);

    // Initialize liquidator keypair
    const liquidatorKeyPair = KeyPair.fromPrivateKey(config.liquidatorPrivateKey);

    // Find users eligible for liquidation
    const eligibleUsers = await findUsersEligibleForLiquidation(client, config);

    if (eligibleUsers.length === 0) {
      console.log('No users eligible for liquidation found');
      return;
    }

    console.log(`Processing ${eligibleUsers.length} users eligible for liquidation`);

    for (const user of eligibleUsers) {
      console.log(`Processing user ${user.userId} with health factor ${user.healthFactor}`);

      const strategy = calculateOptimalLiquidationStrategy(user);
      if (!strategy) {
        console.log(`No viable liquidation strategy found for user ${user.userId}`);
        continue;
      }

      // Create auth operation
      await ftAuthOperationFor(client, liquidatorKeyPair);

      // Execute liquidation
      const success = await executeLiquidation(
        client,
        liquidatorKeyPair,
        config.liquidatorAccountId,
        user.userId,
        strategy.collateralAssetId,
        strategy.debtAssetId
      );

      if (success) {
        console.log(`Successfully liquidated user ${user.userId}`);
      } else {
        console.log(`Failed to liquidate user ${user.userId}`);
      }
    }

    console.log('Liquidation check completed');
  } catch (error) {
    console.error('Liquidation process failed:', error);
  }
};

// Run liquidation if this script is executed directly
if (require.main === module) {
  runLiquidation().catch(console.error);
}

export { runLiquidation };
