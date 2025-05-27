import { op } from '@chromia/ft4';
import { admin_kp } from '../configs/key-pair';
import { getClient } from '../clients';
import chalk from 'chalk';
import { getSessionOrRegister } from '../helpers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ASSET_CONFIG, TOKENS } from '../configs/tokens';

async function mintAsset() {
  try {
    console.log(chalk.bold.cyan(`=== Starting Asset Minting Process for All Tokens ===`));
    const client = await getClient();
    const adminSession = await getSessionOrRegister(client, admin_kp);

    // Loop through all tokens and perform mint operations
    for (const token of TOKENS) {
      // Convert mint amount to RAY
      const mintAmount = parseUnits(ASSET_CONFIG.MINT_AMOUNT, token.decimals);
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
        chalk.blue(`🔄 Minting ${ASSET_CONFIG.MINT_AMOUNT} ${token.symbol} to admin ...`)
      );

      await adminSession.call(
        op(
          'mint_underlying_asset',
          adminSession.account.id,
          BigInt(mintAmount.toString()),
          underlyingAssetId
        )
      );

      console.log(
        chalk.green(
          `✅ Minted ${chalk.yellow(formatUnits(mintAmount, token.decimals))} ${token.symbol} tokens to admin...`
        )
      );

      // Enable collateral
      console.log(chalk.blue('🔄 Enabling collateral...'));

      await adminSession.call(
        op(
          'set_using_as_collateral_op',
          adminSession.account.id,
          underlyingAssetId,
          true // enable collateral
        )
      );

      console.log(chalk.green(`✅ Collateral enabled for ${token.symbol}`));

      // admin supply each asset amount tokens in to pool
      console.log(chalk.blue('🔄 Performing supply operation for TUT...'));
      const supplyAmount = parseUnits('1000', token.decimals); // 30 RAY
      const result = await adminSession.call(
        op(
          'supply',
          adminSession.account.id,
          underlyingAssetId,
          BigInt(supplyAmount.toString()),
          adminSession.account.id,
          BigInt(0) // referral code
        )
      );
      const isSuccess = result.receipt.statusCode === 200;
      console.log(
        isSuccess
          ? chalk.green(
              `✅ Supply ${formatUnits(supplyAmount.toString(), token.decimals)} ${token.symbol} operation completed successfully`
            )
          : chalk.red('❌ Supply operation failed')
      );
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
