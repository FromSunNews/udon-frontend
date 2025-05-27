import BigNumber from 'bignumber.js';
import { valueToBigNumber } from './bignumber';
import { calculateHealthFactorFromBalancesBigUnits } from './pool-math';

export const calculateHFAfterSupply = (
  totalCollateralBeforeSupply: string,
  supplyAmount: BigNumber,
  currentLiquidationThreshold: BigNumber,
  formattedReserveLiquidationThreshold: BigNumber,
  totalCollateralMarketReferenceCurrency: BigNumber,
  totalBorrowsMarketReferenceCurrency: BigNumber,
  userHealFactor = '-1'
) => {
  let healthFactorAfterDeposit = valueToBigNumber(userHealFactor);
  // total collater after we supply = total_collater_before + amount_deposit_extra
  const totalCollateralAfterSupply = valueToBigNumber(totalCollateralBeforeSupply).plus(
    supplyAmount
  );
  const liquidationThresholdAfter = valueToBigNumber(totalCollateralMarketReferenceCurrency)
    .multipliedBy(currentLiquidationThreshold)
    .plus(supplyAmount.multipliedBy(formattedReserveLiquidationThreshold))
    .dividedBy(totalCollateralAfterSupply);

  healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralAfterSupply,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(totalBorrowsMarketReferenceCurrency),
    currentLiquidationThreshold: liquidationThresholdAfter,
  });

  return healthFactorAfterDeposit;
};
