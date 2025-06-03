'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CircleX, Info, ArrowRight } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { useAssetPrice } from '@/hooks/contracts/queries/use-asset-price';
import { useRepay } from '@/hooks/contracts/operations/use-repay';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/dialog';
import { Button } from '@/components/common/button';
import { Typography } from '@/components/common/typography';
import { Input } from '@/components/common/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/avatar';
import { Skeleton } from '@/components/common/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/common/tooltip';
import { UserReserveData, UserAccountData } from '../../types';
import CountUp from '@/components/common/count-up';
import { Alert, AlertDescription, AlertTitle } from '@/components/common/alert';
import { calculateHFAfterRepay } from '@/utils/hf';
import { normalize, normalizeBN, valueToBigNumber } from '@/utils/bignumber';

const repayFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required!')
    .refine(
      val => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      {
        message: 'Please enter a valid positive number',
      }
    ),
});

type RepayFormValues = z.infer<typeof repayFormSchema>;

export interface RepayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserve: UserReserveData;
  accountData: UserAccountData;
  mutateAssets: () => void;
}

// Create a debounced fetch function with lodash
const debouncedFn = debounce((callback: () => void) => {
  callback();
}, 1000);

export const RepayDialog: React.FC<RepayDialogProps> = ({
  open,
  onOpenChange,
  reserve,
  accountData,
  mutateAssets,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(reserve.price);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [isRefetchEnabled, setIsRefetchEnabled] = useState(false);
  const [calculatedHealthFactor, setCalculatedHealthFactor] = useState<number>(-1);

  const maxAmount =
    Number(reserve.balance) > Number(reserve.currentVariableDebt)
      ? Number(reserve.currentVariableDebt)
      : Number(reserve.balance);

  console.log('reserve', reserve.balance, reserve.currentVariableDebt);
  console.log('maxAmount', maxAmount);

  const repaySource = 'wallet';

  const form = useForm<RepayFormValues>({
    resolver: zodResolver(repayFormSchema),
    defaultValues: {
      amount: '',
    },
  });

  // Use the asset price hook with TanStack Query
  const {
    data: priceData,
    isLoading: isPriceFetching,
    refetch: fetchPrice,
  } = useAssetPrice(reserve.assetId, isRefetchEnabled);

  // Use the repay hook
  const repay = useRepay({
    onSuccess: (result, params) => {
      console.log('Repay success:', { result, params });
      mutateAssets();
    },
    onError: (error, params) => {
      console.error('Repay error:', { error, params });
    },
  });

  // Calculate health factor based on current input
  const calculateHealthFactor = useCallback(() => {
    if (accountData.healthFactor === -1) {
      setCalculatedHealthFactor(-1);
      return;
    }

    const amount = form.watch('amount');
    if (!amount || Number(amount) <= 0) {
      setCalculatedHealthFactor(
        Number(normalizeBN(valueToBigNumber(accountData.healthFactor.toString()), 18))
      );
      return;
    }

    const hf = calculateHFAfterRepay(
      valueToBigNumber(accountData.totalCollateralBase.toString()),
      valueToBigNumber(normalize(reserve.price.toString(), 18)).multipliedBy(
        valueToBigNumber(amount)
      ),
      valueToBigNumber(accountData.totalDebtBase.toString()),
      valueToBigNumber((Number(accountData.currentLiquidationThreshold) / 100).toString()),
      valueToBigNumber(accountData.healthFactor.toString())
    );

    console.log('hf after repay', hf.toString());
    setCalculatedHealthFactor(Number(hf));
  }, [accountData, form, reserve.price]);

  // Handle price fetch with lodash debounce
  const handleFetchPrice = useCallback(() => {
    debouncedFn(() => {
      // Don't allow value > max amount based on source
      const valueWithBalance =
        Number(form.watch('amount')) > Number(maxAmount) ? maxAmount : Number(form.watch('amount'));
      const needToChangeValue = valueWithBalance !== Number(form.watch('amount'));
      if (needToChangeValue) {
        form.setValue('amount', valueWithBalance.toString());
        setInputAmount(valueWithBalance.toString());
      }
      setIsRefetchEnabled(true);
      fetchPrice();
      // Calculate health factor after debounce
      calculateHealthFactor();
    });
  }, [fetchPrice, form, maxAmount, calculateHealthFactor]);

  // Update price when data is fetched
  useEffect(() => {
    if (priceData !== null && priceData !== undefined) {
      setCurrentPrice(priceData);
      // Disable refetching to prevent unnecessary calls
      setIsRefetchEnabled(false);
    }
  }, [priceData]);

  // Initialize with asset price and calculate initial health factor
  useEffect(() => {
    setCurrentPrice(reserve.price);
    calculateHealthFactor();
  }, [reserve.price, calculateHealthFactor]);

  // Watch for input changes and fetch price
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow numbers and a single decimal point
    const regex = /^$|^[0-9]+\.?[0-9]*$/;
    if (!regex.test(value)) {
      // if don't pass set input with 0
      form.setValue('amount', '0');
      setInputAmount('0');
      return;
    }

    form.setValue('amount', value);
    setInputAmount(value);

    if (value && parseFloat(value) > 0) {
      handleFetchPrice();
    } else {
      // If amount is empty or 0, reset health factor to current
      setCalculatedHealthFactor(
        accountData.healthFactor === -1
          ? -1
          : Number(normalizeBN(valueToBigNumber(accountData.healthFactor.toString()), 18))
      );
    }
  };

  const handleMaxAmount = () => {
    // Use the appropriate maximum based on the repayment source
    form.setValue('amount', maxAmount.toString());
    setInputAmount(maxAmount.toString());
    handleFetchPrice();
  };

  const selectedToken = {
    symbol: reserve.symbol,
    type: 'wallet',
    iconUrl: reserve.iconUrl,
  };

  const onSubmit = async (data: RepayFormValues) => {
    try {
      const amount = Number(data.amount);

      // Final validation checks before submission
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid positive number');
        return;
      }

      // Check if amount exceeds max based on source
      if (amount > Number(maxAmount)) {
        toast.error(
          `Amount exceeds your ${repaySource === 'wallet' ? 'wallet' : 'debt'} balance of ${maxAmount} ${reserve.symbol}`
        );
        return;
      }

      setIsSubmitting(true);

      // Use the repay hook with the correct source
      const repayResult = await repay({
        assetId: reserve.assetId,
        amount: data.amount,
        decimals: reserve.decimals,
        useWalletBalance: repaySource === 'wallet',
        isRepayMax: Number(form.watch('amount')) === Number(reserve.currentVariableDebt),
      });

      console.log('Repay submitted:', {
        amount: data.amount,
        source: repaySource,
        result: repayResult,
      });

      if (repayResult.success) {
        toast.success(`Successfully repaid ${data.amount} ${selectedToken.symbol}`);
        // Close dialog after successful operation
        onOpenChange(false);
      } else {
        toast.error(`Failed to repay: ${repayResult.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting repay:', error);
      toast.error('Failed to submit repay transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate remaining debt after repayment
  const remainingDebt = Math.max(
    0,
    Number(reserve.currentVariableDebt) - Number(inputAmount || '0')
  ).toFixed(7);

  const currentHealthFactor =
    accountData.healthFactor === -1
      ? -1
      : normalizeBN(valueToBigNumber(accountData.healthFactor.toString()), 18);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <TooltipProvider delayDuration={300}>
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-semibold">Repay {reserve.symbol}</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Typography className="flex items-center gap-1">Amount</Typography>
                </div>

                <div className="border px-3 py-2 rounded-lg">
                  <div className="relative">
                    <Input
                      {...form.register('amount')}
                      autoComplete="off"
                      placeholder="0.00"
                      className="p-0 text-xl font-medium placeholder:text-submerged focus-visible:ring-tranparent focus-visible:outline-none focus-visible:ring-0 w-[60%]"
                      inputMode="decimal"
                      pattern="[0-9]*[.]?[0-9]*"
                      min={0.0}
                      max={repaySource === 'wallet' ? reserve.balance : reserve.currentVariableDebt}
                      step="any"
                      onChange={handleAmountChange}
                      disabled={maxAmount === 0}
                    />
                    <div className="flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2">
                      {/* clear icon */}
                      {form.watch('amount') && (
                        <Button
                          variant="none"
                          size="icon"
                          onClick={() => {
                            form.setValue('amount', '');
                            setInputAmount('');
                            // Reset health factor when clearing input
                            setCalculatedHealthFactor(
                              accountData.healthFactor === -1
                                ? -1
                                : Number(
                                    normalizeBN(
                                      valueToBigNumber(accountData.healthFactor.toString()),
                                      18
                                    )
                                  )
                            );
                          }}
                          className="hover:opacity-70"
                        >
                          <CircleX className="h-6 w-6 text-embossed" />
                        </Button>
                      )}
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={reserve.iconUrl} alt={reserve.symbol} />
                        <AvatarFallback>{reserve.symbol.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-row items-center gap-1">
                        <span className="font-medium text-lg">{reserve.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-base">
                    {isPriceFetching ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      <CountUp
                        value={(currentPrice || 0) * Number(form.watch('amount'))}
                        prefix="$"
                        className="text-base"
                        animateOnlyOnce={true}
                      />
                    )}
                    <div
                      className="flex flex-row items-center gap-1 text-primary cursor-pointer"
                      onClick={handleMaxAmount}
                    >
                      <Typography>{repaySource === 'wallet' ? `Debt` : `Debt balance`}</Typography>
                      <CountUp value={maxAmount} className="font-bold" animateOnlyOnce={true} />
                      <Typography className="font-bold text-primary">MAX</Typography>
                    </div>
                  </div>
                </div>

                {form.formState.errors.amount && (
                  <Typography className="text-destructive">
                    {form.formState.errors.amount.message}
                  </Typography>
                )}
              </div>

              <div className="space-y-4">
                <Typography weight="semibold" className="text-lg">
                  Transaction overview
                </Typography>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">Remaining debt</Typography>
                  <div className="flex items-center">
                    <Typography weight="medium">
                      <CountUp
                        value={Number(remainingDebt)}
                        suffix={` ${reserve.symbol}`}
                        animateOnlyOnce={true}
                      />
                    </Typography>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">
                    Health factor
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Liquidation occurs when health factor is below 1.0</p>
                      </TooltipContent>
                    </Tooltip>
                  </Typography>

                  <div className="flex flex-row items-center justify-center gap-1">
                    {Number(currentHealthFactor) === -1 ? (
                      <Typography className="text-green-500 text-3xl text-bold">∞</Typography>
                    ) : (
                      <CountUp
                        value={Number(currentHealthFactor)}
                        decimals={2}
                        className={
                          Number(currentHealthFactor) === -1
                            ? 'text-green-500'
                            : Number(currentHealthFactor) <= 1.25
                              ? 'text-red-500'
                              : Number(currentHealthFactor) <= 1.5
                                ? 'text-amber-500'
                                : 'text-green-500'
                        }
                        animateOnlyOnce={true}
                      />
                    )}

                    {/* icon arrow left to right */}
                    <ArrowRight className="h-4 w-4 mb-1 text-muted-foreground" />

                    {calculatedHealthFactor === -1 ? (
                      <Typography className="!text-green-500 text-3xl text-bold">∞</Typography>
                    ) : (
                      <CountUp
                        value={calculatedHealthFactor}
                        decimals={2}
                        className={
                          calculatedHealthFactor === -1
                            ? 'text-green-500'
                            : calculatedHealthFactor <= 1.25
                              ? 'text-red-500'
                              : calculatedHealthFactor <= 1.5
                                ? 'text-amber-500'
                                : 'text-green-500'
                        }
                        animateOnlyOnce={true}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Typography className="flex items-center gap-1">Repay amount</Typography>
                  <div className="font-medium text-base flex flex-row items-center gap-1">
                    <CountUp
                      value={Number(form.watch('amount'))}
                      suffix={` ${reserve.symbol}`}
                      decimals={6}
                    />
                    ~{' '}
                    {isPriceFetching ? (
                      <Skeleton className="inline-block h-5 w-20" />
                    ) : (
                      <CountUp
                        value={(currentPrice || 0) * Number(form.watch('amount'))}
                        prefix="$"
                        className="text-base"
                      />
                    )}
                  </div>
                </div>

                {maxAmount === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-base">No balance</AlertTitle>
                    <AlertDescription className="text-sm">
                      You can not repay this amount, because you don&apos;t have any balance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="mt-4">
              {isSubmitting ? (
                <Button disabled className="w-full bg-muted text-muted-foreground text-lg py-6">
                  Processing...
                </Button>
              ) : !inputAmount || parseFloat(inputAmount) === 0 ? (
                <Button disabled className="w-full text-lg py-6">
                  Enter an amount
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  type="submit"
                  className="w-full text-lg py-6"
                  disabled={!form.watch('amount')}
                >
                  Repay {selectedToken.symbol}
                </Button>
              )}
            </div>
          </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};
