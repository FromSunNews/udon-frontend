import BigNumber from 'bignumber.js';
import { RAY, rayPow } from '@/utils/ray.math';
import { SECONDS_PER_YEAR } from '@/utils/constants';
import { CalculateCompoundedRateRequest } from './types';
import { valueToZDBigNumber } from '@/utils/bignumber';

export function calculateCompoundedRate({
  rate,
  duration,
}: CalculateCompoundedRateRequest): BigNumber {
  return rayPow(valueToZDBigNumber(rate).dividedBy(SECONDS_PER_YEAR).plus(RAY), duration).minus(
    RAY
  );
}
