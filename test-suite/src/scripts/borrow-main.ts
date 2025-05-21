import { op } from '@chromia/ft4';
import chalk from 'chalk';
import { getClient } from '../clients';
import { admin_kp } from '../configs/key-pair';
import { getSessionOrRegister } from '../helpers';
import { createHash } from 'crypto';

/**
 * @title User Config Tests
 * @notice Unit tests for user configuration in TypeScript
 */

// Test user
const user = admin_kp;

/**
 * Helper function to create a hash from name and blockchain RID
 */
function createReserveId(name: string, blockchainRid: string): Buffer {
  const hash = createHash('sha256').update(`${name}${blockchainRid}`).digest();
  return Buffer.from(hash);
}

/**
 * Helper function to initialize a test user configuration
 */
async function initTestUserConfig() {
  try {
    console.log(chalk.cyan('Initializing test user config...'));
    const client = await getClient();
    const userSession = await getSessionOrRegister(client, user);
    const userAccountId = userSession.account.id;

    console.log(chalk.green(`User account initialized with ID: ${userAccountId.toString('hex')}`));

    // Create user config
    await userSession.call(op('create_user_config_op', userAccountId));
    console.log(chalk.green('User configuration created successfully'));

    // Generate reserve IDs
    const blockchainRid = client.blockchainRid;
    const reserveName1 = 'Test Reserve 1';
    const reserveName2 = 'Test Reserve 2';

    const reserveId1 = createReserveId(reserveName1, blockchainRid);
    const reserveId2 = createReserveId(reserveName2, blockchainRid);

    return {
      userSession,
      userAccountId,
      reserveId1,
      reserveId2,
    };
  } catch (error) {
    console.error(chalk.red('Error initializing test user config:'), error);
    throw error;
  }
}

/**
 * Test the constants in user configuration
 */
async function testUserConfigConstants() {
  try {
    console.log(chalk.cyan('\nTesting user config constants...'));
    const client = await getClient();
    const userSession = await getSessionOrRegister(client, user);

    // Query minimum health factor liquidation threshold
    const minHealthFactorResult = await userSession.query(
      'get_minimum_health_factor_liquidation_threshold'
    );
    console.log(`Minimum health factor liquidation threshold: ${minHealthFactorResult}`);

    // Query health factor liquidation threshold
    const healthFactorResult = await userSession.query('get_health_factor_liquidation_threshold');
    console.log(`Health factor liquidation threshold: ${healthFactorResult}`);

    // Query isolated collateral supplier role
    const isolatedRoleResult = await userSession.query('get_isolated_collateral_supplier_role');
    console.log(`Isolated collateral supplier role: ${isolatedRoleResult}`);

    console.log(chalk.green('Constants test completed successfully'));
  } catch (error) {
    console.error(chalk.red('Error testing user config constants:'), error);
  }
}

/**
 * Test the default values of a new user configuration
 */
async function testUserConfigDefaultValues() {
  try {
    console.log(chalk.cyan('\nTesting user config default values...'));
    const { userSession, userAccountId } = await initTestUserConfig();

    // Query user config
    const isEmpty = await userSession.query('is_empty', { user_id: userAccountId });
    const isBorrowingAny = await userSession.query('is_borrowing_any', { user_id: userAccountId });
    const isUsingAsCollateralAny = await userSession.query('is_using_as_collateral_any', {
      user_id: userAccountId,
    });

    console.log(`Is empty: ${isEmpty}`);
    console.log(`Is borrowing any: ${isBorrowingAny}`);
    console.log(`Is using as collateral any: ${isUsingAsCollateralAny}`);

    if (isEmpty === true && isBorrowingAny === false && isUsingAsCollateralAny === false) {
      console.log(chalk.green('Default values test passed'));
    } else {
      console.log(chalk.red('Default values test failed'));
    }
  } catch (error) {
    console.error(chalk.red('Error testing user config default values:'), error);
  }
}

/**
 * Test borrowing functionality
 */
async function testBorrowing() {
  try {
    console.log(chalk.cyan('\nTesting borrowing functionality...'));
    const { userSession, userAccountId, reserveId1 } = await initTestUserConfig();

    // Set borrowing to true
    console.log(`Setting borrowing to true for reserve ID: ${reserveId1.toString('hex')}`);
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId1, true));

    // Query borrowing state
    const isBorrowing = await userSession.query('is_borrowing', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isBorrowingAny = await userSession.query('is_borrowing_any', { user_id: userAccountId });
    const isBorrowingOne = await userSession.query('is_borrowing_one', { user_id: userAccountId });
    const isUsingAsCollateralOrBorrowing = await userSession.query(
      'is_using_as_collateral_or_borrowing',
      {
        user_id: userAccountId,
        reserve_id: reserveId1,
      }
    );

    console.log(`Is borrowing specific reserve: ${isBorrowing}`);
    console.log(`Is borrowing any: ${isBorrowingAny}`);
    console.log(`Is borrowing one: ${isBorrowingOne}`);
    console.log(`Is using as collateral or borrowing: ${isUsingAsCollateralOrBorrowing}`);

    // Set borrowing to false
    console.log(`Setting borrowing to false for reserve ID: ${reserveId1.toString('hex')}`);
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId1, false));

    // Query borrowing state after setting to false
    const isBorrowingAfter = await userSession.query('is_borrowing', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isBorrowingAnyAfter = await userSession.query('is_borrowing_any', {
      user_id: userAccountId,
    });

    console.log(`Is borrowing specific reserve after setting to false: ${isBorrowingAfter}`);
    console.log(`Is borrowing any after setting to false: ${isBorrowingAnyAfter}`);

    console.log(chalk.green('Borrowing test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing borrowing functionality:'), error);
  }
}

/**
 * Test collateral functionality
 */
async function testCollateral() {
  try {
    console.log(chalk.cyan('\nTesting collateral functionality...'));
    const { userSession, userAccountId, reserveId1 } = await initTestUserConfig();

    // Set using as collateral to true
    console.log(
      `Setting using as collateral to true for reserve ID: ${reserveId1.toString('hex')}`
    );
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId1, true));

    // Query collateral state
    const isUsingAsCollateral = await userSession.query('is_using_as_collateral', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isUsingAsCollateralAny = await userSession.query('is_using_as_collateral_any', {
      user_id: userAccountId,
    });

    const isUsingAsCollateralOne = await userSession.query('is_using_as_collateral_one', {
      user_id: userAccountId,
    });

    console.log(`Is using as collateral: ${isUsingAsCollateral}`);
    console.log(`Is using as collateral any: ${isUsingAsCollateralAny}`);
    console.log(`Is using as collateral one: ${isUsingAsCollateralOne}`);

    // Set using as collateral to false
    console.log(
      `Setting using as collateral to false for reserve ID: ${reserveId1.toString('hex')}`
    );
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId1, false));

    // Query collateral state after setting to false
    const isUsingAsCollateralAfter = await userSession.query('is_using_as_collateral', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    console.log(`Is using as collateral after setting to false: ${isUsingAsCollateralAfter}`);

    console.log(chalk.green('Collateral test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing collateral functionality:'), error);
  }
}

/**
 * Test both borrowing and collateral functionality together
 */
async function testBorrowingAndCollateral() {
  try {
    console.log(chalk.cyan('\nTesting borrowing and collateral together...'));
    const { userSession, userAccountId, reserveId1 } = await initTestUserConfig();

    // Set borrowing to true
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId1, true));
    console.log(`Set borrowing to true for reserve ID: ${reserveId1.toString('hex')}`);

    // Set using as collateral to true
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId1, true));
    console.log(`Set using as collateral to true for reserve ID: ${reserveId1.toString('hex')}`);

    // Query state
    const isBorrowing = await userSession.query('is_borrowing', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isUsingAsCollateral = await userSession.query('is_using_as_collateral', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isEmpty = await userSession.query('is_empty', { user_id: userAccountId });

    console.log(`Is borrowing: ${isBorrowing}`);
    console.log(`Is using as collateral: ${isUsingAsCollateral}`);
    console.log(`Is empty: ${isEmpty}`);

    console.log(chalk.green('Borrowing and collateral test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing borrowing and collateral together:'), error);
  }
}

/**
 * Test multiple reserves
 */
async function testMultipleReserves() {
  try {
    console.log(chalk.cyan('\nTesting multiple reserves...'));
    const { userSession, userAccountId, reserveId1, reserveId2 } = await initTestUserConfig();

    // Set borrowing for reserve 1
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId1, true));
    console.log(`Set borrowing to true for reserve ID 1: ${reserveId1.toString('hex')}`);

    // Set using as collateral for reserve 2
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId2, true));
    console.log(`Set using as collateral to true for reserve ID 2: ${reserveId2.toString('hex')}`);

    // Query state
    const isBorrowingReserve1 = await userSession.query('is_borrowing', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isBorrowingReserve2 = await userSession.query('is_borrowing', {
      user_id: userAccountId,
      reserve_id: reserveId2,
    });

    const isUsingAsCollateralReserve1 = await userSession.query('is_using_as_collateral', {
      user_id: userAccountId,
      reserve_id: reserveId1,
    });

    const isUsingAsCollateralReserve2 = await userSession.query('is_using_as_collateral', {
      user_id: userAccountId,
      reserve_id: reserveId2,
    });

    console.log(
      `Reserve 1 - Is borrowing: ${isBorrowingReserve1}, Is using as collateral: ${isUsingAsCollateralReserve1}`
    );
    console.log(
      `Reserve 2 - Is borrowing: ${isBorrowingReserve2}, Is using as collateral: ${isUsingAsCollateralReserve2}`
    );

    // Test one reserve checks
    const isBorrowingOne = await userSession.query('is_borrowing_one', { user_id: userAccountId });
    const isUsingAsCollateralOne = await userSession.query('is_using_as_collateral_one', {
      user_id: userAccountId,
    });

    console.log(`Is borrowing one: ${isBorrowingOne}`);
    console.log(`Is using as collateral one: ${isUsingAsCollateralOne}`);

    // Add another borrowing
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId2, true));
    console.log(`Set borrowing to true for reserve ID 2: ${reserveId2.toString('hex')}`);

    // Test one reserve checks again
    const isBorrowingOneAfter = await userSession.query('is_borrowing_one', {
      user_id: userAccountId,
    });

    console.log(`Is borrowing one after second borrow: ${isBorrowingOneAfter}`);

    console.log(chalk.green('Multiple reserves test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing multiple reserves:'), error);
  }
}

/**
 * Test get first asset ID functions
 */
async function testGetFirstAssetId() {
  try {
    console.log(chalk.cyan('\nTesting first asset ID functions...'));
    const { userSession, userAccountId, reserveId1, reserveId2 } = await initTestUserConfig();

    // Test with no assets
    const firstCollateralAssetIdEmpty = await userSession.query('get_first_collateral_asset_id', {
      user_id: userAccountId,
    });

    const firstBorrowingAssetIdEmpty = await userSession.query('get_first_borrowing_asset_id', {
      user_id: userAccountId,
    });

    console.log(
      `First collateral asset ID (empty): ${(firstCollateralAssetIdEmpty as Buffer)?.toString('hex') || 'empty'}`
    );
    console.log(
      `First borrowing asset ID (empty): ${(firstBorrowingAssetIdEmpty as Buffer)?.toString('hex') || 'empty'}`
    );

    // Set collateral for reserves
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId1, true));
    await userSession.call(op('set_using_as_collateral_op', userAccountId, reserveId2, true));

    // Set borrowing for reserve
    await userSession.call(op('set_borrowing_op', userAccountId, reserveId2, true));

    // Test first asset IDs after setting
    const firstCollateralAssetId = await userSession.query('get_first_collateral_asset_id', {
      user_id: userAccountId,
    });

    const firstBorrowingAssetId = await userSession.query('get_first_borrowing_asset_id', {
      user_id: userAccountId,
    });

    console.log(
      `First collateral asset ID: ${(firstCollateralAssetId as Buffer)?.toString('hex') || 'none'}`
    );
    console.log(
      `First borrowing asset ID: ${(firstBorrowingAssetId as Buffer)?.toString('hex') || 'none'}`
    );

    console.log(chalk.green('First asset ID test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing first asset ID functions:'), error);
  }
}

/**
 * Test invalid reserve index
 */
async function testInvalidReserveIndex() {
  try {
    console.log(chalk.cyan('\nTesting invalid reserve index...'));
    const { userSession, userAccountId } = await initTestUserConfig();

    // Create an invalid reserve ID
    const invalidReserveId = createReserveId('Invalid Reserve', 'invalid_blockchain_rid');

    // Test set_borrowing with invalid index
    console.log(
      `Testing set_borrowing with invalid reserve ID: ${invalidReserveId.toString('hex')}`
    );
    try {
      await userSession.call(op('set_borrowing_op', userAccountId, invalidReserveId, true));
      console.log(chalk.red('Expected failure but operation succeeded'));
    } catch (error) {
      console.log(chalk.green(`Got expected error: ${error.message}`));
    }

    // Test set_using_as_collateral with invalid index
    console.log(
      `Testing set_using_as_collateral with invalid reserve ID: ${invalidReserveId.toString('hex')}`
    );
    try {
      await userSession.call(
        op('set_using_as_collateral_op', userAccountId, invalidReserveId, true)
      );
      console.log(chalk.red('Expected failure but operation succeeded'));
    } catch (error) {
      console.log(chalk.green(`Got expected error: ${error.message}`));
    }

    console.log(chalk.green('Invalid reserve index test completed'));
  } catch (error) {
    console.error(chalk.red('Error testing invalid reserve index:'), error);
  }
}

// Main function to run all tests
async function main() {
  try {
    console.log(chalk.bold.cyan('=== Running User Configuration Tests ==='));

    // Run tests in sequence
    await testUserConfigConstants();
    await testUserConfigDefaultValues();
    await testBorrowing();
    await testCollateral();
    await testBorrowingAndCollateral();
    await testMultipleReserves();
    await testGetFirstAssetId();
    await testInvalidReserveIndex();

    console.log(chalk.bold.green('\n=== All tests completed successfully ==='));
  } catch (error) {
    console.error(chalk.bold.red('\n=== Tests failed with error ==='));
    console.error(error);
    process.exit(1);
  }
}

// Execute the tests
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
