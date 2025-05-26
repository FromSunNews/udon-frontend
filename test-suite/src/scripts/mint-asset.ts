import { op } from '@chromia/ft4';
import { admin_kp } from '../configs/key-pair';
import { getClient } from '../clients';
import chalk from 'chalk';
import { formatRay, RAY } from '../helpers/wadraymath';
import { BigNumber } from 'ethers';
import { getSessionOrRegister } from '../helpers';
import { ensureBuffer } from '../helpers/buffer';

// hippo: A8A05014A795D77C4FA12FDF08776FD70799549530F27ABB3B3331FB4D0A2AC8
// nathan: 5D3D574FA59149FE64E7495907FA047A2AC80EA0524D66373D12770104A0B0FA

// Define constants for minting
// Users can modify these values before running the script
const ASSET_CONFIG = {
  // The amount to mint in whole tokens (will be converted to RAY)
  MINT_AMOUNT: 1000,
  // Target user ID
  TARGET_USER_ID: ensureBuffer('5D3D574FA59149FE64E7495907FA047A2AC80EA0524D66373D12770104A0B0FA'),
};

// Asset configurations
const TOKENS = [
  // {
  //   name: 'Bitcoin USD',
  //   symbol: 'BTCUSD',
  //   decimals: 8,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1.png',
  // },
  // {
  //   name: 'Ethereum USD',
  //   symbol: 'ETHUSD',
  //   decimals: 8,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/1027.png',
  // },
  // {
  //   name: 'MyNeighborAlice',
  //   symbol: 'ALICEUSD',
  //   decimals: 8,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/8766.png',
  // },
  // {
  //   name: 'DAR Open Network',
  //   symbol: 'DUSD',
  //   decimals: 8,
  //   icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/11374.png',
  // },
  {
    name: 'Chromia USD',
    symbol: 'CHRUSD',
    decimals: 8,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3978.png',
  },
  {
    name: 'USDT',
    symbol: 'USDTUSD',
    decimals: 8,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/825.png',
  },
  {
    name: 'USDC',
    symbol: 'USDCUSD',
    decimals: 6,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png',
  },
];

async function mintAsset() {
  try {
    console.log(chalk.bold.cyan(`=== Starting Asset Minting Process for All Tokens ===`));
    const client = await getClient();
    const adminSession = await getSessionOrRegister(client, admin_kp);

    // Convert mint amount to RAY
    const mintAmount = BigNumber.from(RAY).mul(ASSET_CONFIG.MINT_AMOUNT);

    // Loop through all tokens and perform mint operations
    for (const token of TOKENS) {
      console.log(chalk.bold.yellow(`\nProcessing ${token.symbol}...`));

      // Get asset ID
      console.log(chalk.blue(`🔍 Getting asset ID for ${token.symbol}...`));
      const underlyingAssetResult = await adminSession.getAssetsBySymbol(token.symbol);
      const underlyingAssetId = underlyingAssetResult.data[0]?.id;

      if (!underlyingAssetId) {
        console.log(chalk.red(`❌ Asset ${token.symbol} not found. Skipping...`));
        continue;
      }

      console.log(chalk.green(`✅ Found asset ID for ${token.symbol}: ${underlyingAssetId}`));

      // Mint tokens
      console.log(
        chalk.blue(
          `🔄 Minting ${ASSET_CONFIG.MINT_AMOUNT} ${token.symbol} to ${ASSET_CONFIG.TARGET_USER_ID.toString('hex')}...`
        )
      );

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
          `✅ Minted ${chalk.yellow(formatRay(mintAmount))} ${token.symbol} tokens to ${ASSET_CONFIG.TARGET_USER_ID.toString('hex')}`
        )
      );

      // Enable collateral
      console.log(chalk.blue('🔄 Enabling collateral...'));

      await adminSession.call(
        op(
          'set_using_as_collateral_op',
          ASSET_CONFIG.TARGET_USER_ID,
          underlyingAssetId,
          true // enable collateral
        )
      );

      console.log(chalk.green(`✅ Collateral enabled for ${token.symbol}`));
    }

    console.log(
      chalk.bold.green('\n✅✅✅ Asset minting completed successfully for all tokens ✅✅✅')
    );
  } catch (error) {
    console.error(chalk.bold.red('❌❌❌ ERROR IN MINT ASSET ❌❌❌'));
    console.error(chalk.red(error));
  }
}

// Execute the script
mintAsset().catch(error => console.error(chalk.red('Unhandled error:'), error));
