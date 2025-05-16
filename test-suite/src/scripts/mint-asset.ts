import { op } from '@chromia/ft4';
import { admin_kp } from '../configs/key-pair';
import { getClient } from '../clients';
import chalk from 'chalk';
import { formatRay, RAY } from '../helpers/wadraymath';
import { BigNumber } from 'ethers';
import { getSessionOrRegister } from '../helpers';
import { ensureBuffer } from '../helpers/buffer';
import { formatUnits } from 'ethers/lib/utils';

// Define constants for minting
// Users can modify these values before running the script
const ASSET_CONFIG = {
  // Available options: BTC, ETH, ALICE, DUSD, UNDERLYING_TEST_TOKEN
  ASSET_TYPE: 'ALICE',
  // The amount to mint in whole tokens (will be converted to RAY)
  MINT_AMOUNT: 1000,
  // Target account keyPair: admin_kp or user_a_kp
  USE_ADMIN_ACCOUNT: false,
  TARGET_USER_ID: ensureBuffer('A8A05014A795D77C4FA12FDF08776FD70799549530F27ABB3B3331FB4D0A2AC8'),
};

// Asset configurations
const ASSETS = {
  BTC: {
    name: 'Bitcoin Token',
    symbol: 'BTCUSD',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  },
  ETH: {
    name: 'Ethereum Token',
    symbol: 'ETHUSD',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  },
  ALICE: {
    name: 'Alice Token',
    symbol: 'ALICEUSD',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/alice-alice-logo.png',
  },
  DUSD: {
    name: 'Dummy USD',
    symbol: 'DUSD',
    decimals: 8,
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  UNDERLYING_TEST_TOKEN: {
    name: 'Test Underlying Token',
    symbol: 'TUT',
    decimals: 8,
    icon: 'http://example.com/icon.png',
  },
};

async function mintAsset() {
  try {
    console.log(
      chalk.bold.cyan(`=== Starting Asset Minting Process for ${ASSET_CONFIG.ASSET_TYPE} ===`)
    );
    const client = await getClient();
    const adminSession = await getSessionOrRegister(client, admin_kp);
    const selectedAsset = ASSETS[ASSET_CONFIG.ASSET_TYPE];

    const underlyingAssetResult = await adminSession.getAssetsBySymbol(selectedAsset.symbol);
    const underlyingAssetId = underlyingAssetResult.data[0]?.id;

    // Convert mint amount to RAY
    const mintAmount = BigNumber.from(RAY).mul(ASSET_CONFIG.MINT_AMOUNT);
    console.log(
      chalk.blue(
        `🔄 Minting ${ASSET_CONFIG.MINT_AMOUNT} ${selectedAsset.symbol} to ${ASSET_CONFIG.TARGET_USER_ID.toString('hex')}...`
      )
    );

    // Perform the mint operation
    await adminSession.call(
      op(
        'mint_underlying_asset',
        ASSET_CONFIG.TARGET_USER_ID,
        BigInt(mintAmount.toString()),
        underlyingAssetId
      )
    );
    console.log(
      chalk.green(
        `✅ Minted ${chalk.yellow(formatRay(mintAmount))} ${selectedAsset.symbol} tokens to ${ASSET_CONFIG.TARGET_USER_ID.toString('hex')}`
      )
    );

    // Check the final balance
    console.log(chalk.blue('🔄 Checking final balance...'));
    const finalBalance = await adminSession.account.getBalanceByAssetId(underlyingAssetId);
    console.log(
      chalk.green(
        `✅ Final ${selectedAsset.symbol} balance: ${chalk.yellow(formatUnits(finalBalance.amount.value, finalBalance.asset.decimals))}`
      )
    );

    console.log(chalk.bold.green('✅✅✅ Asset minting completed successfully ✅✅✅'));
  } catch (error) {
    console.error(chalk.bold.red('❌❌❌ ERROR IN MINT ASSET ❌❌❌'));
    console.error(chalk.red(error));
  }
}

// Execute the script
mintAsset().catch(error => console.error(chalk.red('Unhandled error:'), error));
