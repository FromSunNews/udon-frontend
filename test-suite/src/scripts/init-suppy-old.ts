import { op } from '@chromia/ft4';
import { admin_kp, user_a_kp } from '../configs/key-pair';
import { registerAccountOpen } from '../common/operations/accounts';
import { getClient } from '../clients';
import chalk from 'chalk';
import { formatRay, RAY } from '../helpers/wadraymath';
import { BigNumber } from 'ethers';

async function initSupply() {
  try {
    console.log(chalk.bold.cyan('=== Starting Supply Initialization Process ==='));

    // Get client and setup sessions
    console.log(chalk.blue('🔄 Setting up client and sessions...'));
    const client = await getClient();
    const adminSession = await registerAccountOpen(client, admin_kp);
    const adminAccountId = adminSession.account.id;

    const userSession = await registerAccountOpen(client, user_a_kp);
    const userAccountId = userSession.account.id;

    console.log(chalk.green('✅ Sessions created successfully'));

    // Initialize ACL module
    console.log(chalk.blue('🔄 Initializing ACL module...'));
    await adminSession.call(op('initialize', admin_kp.pubKey));
    await adminSession.call(op('grant_role', 'POOL_ADMIN', adminAccountId, admin_kp.pubKey));
    console.log(chalk.green('✅ ACL module initialized'));

    // Initialize required factories
    console.log(chalk.blue('🔄 Initializing asset factories...'));
    await adminSession.call(op('initialize_asset_base'));
    await adminSession.call(op('initialize_underlying_asset_factory'));
    await adminSession.call(op('initialize_a_asset_factory'));
    console.log(chalk.green('✅ Asset factories initialized'));

    // Create underlying asset
    console.log(chalk.blue('🔄 Creating underlying asset...'));
    const underlyingAsset = {
      name: 'MyNeighborAlice',
      symbol: 'ALICEUSD',
      decimals: 8,
      icon: 'https://s2.coinmarketcap.com/static/img/coins/128x128/8766.png',
    };

    await adminSession.call(
      op(
        'create_underlying_asset',
        underlyingAsset.name,
        underlyingAsset.symbol,
        underlyingAsset.decimals,
        underlyingAsset.icon
      )
    );

    const underlyingAssetResult = await adminSession.getAssetsBySymbol(underlyingAsset.symbol);
    const underlyingAssetId = underlyingAssetResult.data[0].id;

    console.log(
      chalk.green('✅ Underlying asset created:'),
      chalk.yellow(`${underlyingAsset.symbol} (${underlyingAssetId})`)
    );

    // Create price asset
    await adminSession.call(
      op('create_price_asset', admin_kp.pubKey, underlyingAsset.symbol, underlyingAssetId)
    );
    console.log(chalk.green('✅ Price asset oracle created:'));

    // Set interest rate strategy
    console.log(chalk.blue('🔄 Setting interest rate strategy...'));
    const interestRateParams = {
      optimalUsageRatio: BigNumber.from(RAY).mul(80).div(100), // 0.8 in RAY
      baseVariableBorrowRate: BigNumber.from(RAY).mul(5).div(100), // 0.05 in RAY
      variableRateSlope1: BigNumber.from(RAY).mul(4).div(100), // 0.04 in RAY
      variableRateSlope2: BigNumber.from(RAY).mul(60).div(100), // 0.6 in RAY
    };

    await adminSession.call(
      op(
        'set_default_reserve_interest_rate_strategy',
        underlyingAssetId,
        BigInt(interestRateParams.optimalUsageRatio.toString()),
        BigInt(interestRateParams.baseVariableBorrowRate.toString()),
        BigInt(interestRateParams.variableRateSlope1.toString()),
        BigInt(interestRateParams.variableRateSlope2.toString())
      )
    );
    console.log(chalk.green('✅ Interest rate strategy set'));

    // Configure reserve with a-asset
    console.log(chalk.blue('🔄 Configuring reserve with a-asset...'));
    const aAsset = {
      name: 'AMyNeighborAlice',
      symbol: 'AALICEUSD',
      decimals: 8,
    };

    await adminSession.call(
      op('init_reserve_op', underlyingAssetId, adminAccountId, aAsset.name, aAsset.symbol, '', '')
    );

    const aAssetResult = await adminSession.getAssetsBySymbol(aAsset.symbol);
    const aAssetId = aAssetResult.data[0].id;
    console.log(
      chalk.green('✅ Reserve initialized with a-asset:'),
      chalk.yellow(`${aAsset.symbol} (${aAssetId})`)
    );

    // Mint underlying tokens to user
    console.log(chalk.blue('🔄 Minting underlying tokens to user...'));
    const mintAmount = BigNumber.from(RAY).mul(100); // 100 RAY
    await adminSession.call(
      op('mint_underlying_asset', userAccountId, BigInt(mintAmount.toString()), underlyingAssetId)
    );
    console.log(chalk.green(`✅ Minted ${chalk.yellow(formatRay(mintAmount))} tokens to user`));

    // Supply operation
    console.log(chalk.blue('🔄 Performing supply operation...'));
    const supplyAmount = BigNumber.from(RAY).mul(30); //30 RAY
    const result = await userSession.call(
      op(
        'supply',
        userAccountId,
        underlyingAssetId,
        BigInt(supplyAmount.toString()),
        userAccountId,
        BigInt(0), // referral code
        // get current block timestamp
        Date.now()
      )
    );
    const isSuccess = result.receipt.statusCode === 200;
    console.log(
      isSuccess
        ? chalk.green('✅ Supply operation completed successfully')
        : chalk.red('❌ Supply operation failed')
    );

    const result2 = await userSession.call(
      op(
        'supply',
        userAccountId,
        underlyingAssetId,
        BigInt(supplyAmount.toString()),
        userAccountId,
        BigInt(0), // referral code
        // get current block timestamp
        Date.now()
      )
    );
    const isSuccess2 = result2.receipt.statusCode === 200;
    console.log(
      isSuccess2
        ? chalk.green('✅ Supply 2 operation completed successfully')
        : chalk.red('❌ Supply 2 operation failed')
    );

    // Check final balances using getBalanceByAssetId
    console.log(chalk.blue('🔄 Checking final balances...'));

    // Get user's underlying balance
    const userUnderlyingBalance = await userSession.account.getBalanceByAssetId(underlyingAssetId);

    // Get user's a-asset balance
    const userAAssetBalance = await userSession.account.getBalanceByAssetId(aAssetId);

    console.log(chalk.green('✅ Final balances:'));
    console.log(
      chalk.yellow(`   Underlying balance: ${formatRay(userUnderlyingBalance.amount.value)}`)
    );
    console.log(chalk.yellow(`   A-asset balance: ${formatRay(userAAssetBalance.amount.value)}`));

    console.log(chalk.bold.green('✅✅✅ Supply initialization completed successfully ✅✅✅'));

    // init emode
    console.log(chalk.blue('🔄 Initializing emode...'));
    await adminSession.call(op('initialize_emode_logic'));
    await adminSession.call(op('set_reserve_borrowing', underlyingAssetId, true));
    console.log(chalk.green('✅ Emode initialized'));

    // init borrow mode
    const borrowAmount = BigNumber.from(RAY).mul(30);
    console.log(chalk.blue('🔄 Initializing borrow mode...'));
    await userSession.call(
      op(
        'borrow',
        underlyingAssetId,
        BigInt(borrowAmount.toString()),
        2,
        0,
        userAccountId,
        Date.now()
      )
    );
    console.log(chalk.green('✅ Borrow mode initialized'));

    // check balances
    console.log(chalk.blue('🔄 Checking final balances...'));
    const userUnderlyingBalance2 = await userSession.account.getBalanceByAssetId(underlyingAssetId);
    const userAAssetBalance2 = await userSession.account.getBalanceByAssetId(aAssetId);
    console.log(chalk.green('✅ Final balances:'));
    console.log(
      chalk.yellow(`   Underlying balance: ${formatRay(userUnderlyingBalance2.amount.value)}`)
    );
    console.log(chalk.yellow(`   A-asset balance: ${formatRay(userAAssetBalance2.amount.value)}`));

    console.log(chalk.bold.green('✅✅✅ Supply initialization completed successfully ✅✅✅'));
  } catch (error) {
    console.error(chalk.bold.red('❌❌❌ ERROR IN INIT SUPPLY ❌❌❌'));
    console.error(chalk.red(error));
  }
}

// Execute the script
initSupply().catch(error => console.error(chalk.red('Unhandled error:'), error));
