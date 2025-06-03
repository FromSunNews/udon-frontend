import BigNumber from 'bignumber.js';
import { calculateHealthFactorFromBalancesBigUnits } from './pool-math';
import { valueToBigNumber } from './bignumber';

export const calculateHFAfterWithdraw = (
  totalCollateralBeforeWithdraw: BigNumber,
  collateralToWithdraw: BigNumber,
  userLiquidationThreshold: string,
  reserveLiquidationThreshold: string,
  totalDebt: BigNumber,
  userHealFactor: BigNumber,
  isCollateral: boolean
) => {
  console.log('totalCollateralBeforeWithdraw', totalCollateralBeforeWithdraw.toString());
  console.log('collateralToWithdraw', collateralToWithdraw.toString());
  console.log('userLiquidationThreshold', userLiquidationThreshold);
  console.log('reserveLiquidationThreshold', reserveLiquidationThreshold);
  console.log('totalDebt', totalDebt.toString());
  console.log('userHealFactor', userHealFactor.toString());
  console.log('isCollateral', isCollateral);
  // total collater after we withdraw = total_collater_before - amount_withdraw_extra
  const totalCollateralAfterWithdraw = totalCollateralBeforeWithdraw.minus(collateralToWithdraw);
  let healthFactorAfterWithdraw = userHealFactor;
  let liquidationThresholdAfterWithdraw = userLiquidationThreshold;
  console.log('totalCollateralAfterWithdraw', totalCollateralAfterWithdraw.toString());

  // if collateral is not used as collateral, we don't need to calculate the liquidation threshold
  if (isCollateral && reserveLiquidationThreshold !== '0') {
    liquidationThresholdAfterWithdraw = totalCollateralBeforeWithdraw
      .multipliedBy(userLiquidationThreshold)
      .minus(collateralToWithdraw.multipliedBy(reserveLiquidationThreshold))
      .div(valueToBigNumber(totalCollateralAfterWithdraw))
      .dividedBy(100)
      .toFixed(4, BigNumber.ROUND_DOWN);

    console.log('liquidationThresholdAfterWithdraw', liquidationThresholdAfterWithdraw);

    healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits({
      totalCollateral: totalCollateralAfterWithdraw,
      totalDebt: totalDebt,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    });

    console.log('healthFactorAfterWithdraw', healthFactorAfterWithdraw.toString());
  }

  return healthFactorAfterWithdraw;
};

export const calculateHFAfterSupply = (
  totalCollateralBeforeSupply: BigNumber,
  collateralToSupply: BigNumber,
  userLiquidationThreshold: BigNumber,
  reserveLiquidationThreshold: BigNumber,
  totalDebt: BigNumber,
  userHealFactor: BigNumber
) => {
  let healthFactorAfterDeposit = userHealFactor;
  // total collater after we supply = total_collater_before + amount_deposit_extra
  console.log('totalCollateralBeforeSupply', totalCollateralBeforeSupply.toString());
  console.log('supplyAmount', collateralToSupply.toString());
  console.log('userLiquidationThreshold', userLiquidationThreshold.toString());
  console.log('reserveLiquidationThreshold', reserveLiquidationThreshold.toString());
  console.log('totalDebt', totalDebt.toString());
  console.log('userHealFactor', userHealFactor.toString());
  const totalCollateralAfterSupply = totalCollateralBeforeSupply.plus(collateralToSupply);
  console.log('totalCollateralAfterSupply', totalCollateralAfterSupply.toString());
  const liquidationThresholdAfter = totalCollateralBeforeSupply
    .multipliedBy(userLiquidationThreshold)
    .plus(collateralToSupply.multipliedBy(reserveLiquidationThreshold))
    .dividedBy(totalCollateralAfterSupply)
    .dividedBy(100);

  console.log('liquidationThresholdAfter', liquidationThresholdAfter.toString());

  healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
    totalCollateral: totalCollateralAfterSupply,
    totalDebt: totalDebt,
    currentLiquidationThreshold: liquidationThresholdAfter,
  });

  console.log('healthFactorAfterDeposit', healthFactorAfterDeposit.toString());

  return healthFactorAfterDeposit;
};

export const calculateHFAfterBorrow = (
  totalCollateral: BigNumber,
  debtToAdd: BigNumber,
  totalDebtBeforeBorrow: BigNumber,
  currentLiquidationThreshold: BigNumber,
  userHealFactor: BigNumber
) => {
  console.log('totalCollateral', totalCollateral.toString());
  console.log('debtToAdd', debtToAdd.toString());
  console.log('totalDebtBeforeBorrow', totalDebtBeforeBorrow.toString());
  console.log('currentLiquidationThreshold', currentLiquidationThreshold.toString());
  console.log('userHealFactor', userHealFactor.toString());

  // Calculate total debt after borrowing
  const totalDebtAfterBorrow = totalDebtBeforeBorrow.plus(debtToAdd);
  console.log('totalDebtAfterBorrow', totalDebtAfterBorrow.toString());

  // When borrowing, the liquidation threshold does not change since we're not altering the composition of collateral
  // But if we need to recalculate it to account for potential changes, we can use this formula:
  // Note: in most lending protocols, borrowing doesn't affect liquidation threshold directly since it's based on collateral
  const liquidationThresholdAfterBorrow = currentLiquidationThreshold.dividedBy(100);
  console.log('liquidationThresholdAfterBorrow', liquidationThresholdAfterBorrow.toString());

  // Calculate new health factor
  const healthFactorAfterBorrow = calculateHealthFactorFromBalancesBigUnits({
    totalCollateral: totalCollateral,
    totalDebt: totalDebtAfterBorrow,
    currentLiquidationThreshold: liquidationThresholdAfterBorrow,
  });

  console.log('healthFactorAfterBorrow', healthFactorAfterBorrow.toString());
  return healthFactorAfterBorrow;
};

export const calculateHFAfterRepay = (
  totalCollateral: BigNumber,
  debtToRepay: BigNumber,
  totalDebtBeforeRepay: BigNumber,
  currentLiquidationThreshold: BigNumber,
  userHealFactor: BigNumber
) => {
  console.log('totalCollateral', totalCollateral.toString());
  console.log('debtToRepay', debtToRepay.toString());
  console.log('totalDebtBeforeRepay', totalDebtBeforeRepay.toString());
  console.log('currentLiquidationThreshold', currentLiquidationThreshold.toString());
  console.log('userHealFactor', userHealFactor.toString());

  // Calculate total debt after repaying (ensure it doesn't go below zero)
  const totalDebtAfterRepay = BigNumber.maximum(
    totalDebtBeforeRepay.minus(debtToRepay),
    new BigNumber(0)
  );
  console.log('totalDebtAfterRepay', totalDebtAfterRepay.toString());

  // When repaying, the liquidation threshold does not change since we're not altering the composition of collateral
  // However, we can calculate it if needed with weighted averages of the remaining assets
  const liquidationThresholdAfterRepay = currentLiquidationThreshold.dividedBy(100);
  console.log('liquidationThresholdAfterRepay', liquidationThresholdAfterRepay.toString());

  // If total debt becomes zero, health factor is infinite (-1)
  if (totalDebtAfterRepay.isZero()) {
    console.log('healthFactorAfterRepay: INFINITE (-1)');
    return new BigNumber(-1);
  }

  // Calculate new health factor
  const healthFactorAfterRepay = calculateHealthFactorFromBalancesBigUnits({
    totalCollateral: totalCollateral,
    totalDebt: totalDebtAfterRepay,
    currentLiquidationThreshold: liquidationThresholdAfterRepay,
  });

  console.log('healthFactorAfterRepay', healthFactorAfterRepay.toString());
  return healthFactorAfterRepay;
};

export const calculateHFAfterCallUsageAsCollateral = (
  totalCollateral: BigNumber,
  assetCollateral: BigNumber,
  userLiquidationThreshold: BigNumber,
  reserveLiquidationThreshold: BigNumber,
  totalDebt: BigNumber,
  userHealFactor: BigNumber,
  isCollateralEnabled: boolean
) => {
  console.log('totalCollateral', totalCollateral.toString());
  console.log('assetCollateral', assetCollateral.toString());
  console.log('userLiquidationThreshold', userLiquidationThreshold.toString());
  console.log('reserveLiquidationThreshold', reserveLiquidationThreshold.toString());
  console.log('totalDebt', totalDebt.toString());
  console.log('userHealFactor', userHealFactor.toString());
  console.log('isCollateralEnabled', isCollateralEnabled);

  let liquidationThresholdAfterCall = userLiquidationThreshold;
  let healthFactorAfterCall = userHealFactor;

  // If debt is zero, health factor is always infinite
  if (totalDebt.isZero()) {
    return new BigNumber(-1); // -1 represents infinite health factor
  }

  // Calculate new liquidation threshold based on collateral status change
  if (isCollateralEnabled) {
    // Currently enabled -> going to disable
    // We need to remove this asset from the collateral calculation
    // Formula: (totalCollateral * userLiquidationThreshold - assetCollateral * reserveLiquidationThreshold) / (totalCollateral - assetCollateral)
    // Need to check if this will leave any collateral
    if (totalCollateral.isEqualTo(assetCollateral)) {
      // No collateral left after disabling this asset
      liquidationThresholdAfterCall = new BigNumber(0);
      // With no collateral and existing debt, health factor would be 0
      return new BigNumber(0);
    } else {
      // Calculate new liquidation threshold after removing this asset from collateral
      const collateralAfterCall = totalCollateral.minus(assetCollateral);
      liquidationThresholdAfterCall = totalCollateral
        .multipliedBy(userLiquidationThreshold)
        .minus(assetCollateral.multipliedBy(reserveLiquidationThreshold))
        .dividedBy(collateralAfterCall)
        .dividedBy(100);
    }
  } else {
    // Currently disabled -> going to enable
    // We add this asset to the collateral calculation
    // Formula: (totalCollateral * userLiquidationThreshold + assetCollateral * reserveLiquidationThreshold) / totalCollateral
    liquidationThresholdAfterCall = totalCollateral
      .multipliedBy(userLiquidationThreshold)
      .plus(assetCollateral.multipliedBy(reserveLiquidationThreshold))
      .dividedBy(totalCollateral)
      .dividedBy(100);
  }

  console.log('liquidationThresholdAfterCall', liquidationThresholdAfterCall.toString());

  // Calculate new health factor based on the new liquidation threshold
  healthFactorAfterCall = calculateHealthFactorFromBalancesBigUnits({
    totalCollateral: isCollateralEnabled ? totalCollateral.minus(assetCollateral) : totalCollateral,
    totalDebt: totalDebt,
    currentLiquidationThreshold: liquidationThresholdAfterCall,
  });

  console.log('healthFactorAfterCall', healthFactorAfterCall.toString());
  return healthFactorAfterCall;
};
